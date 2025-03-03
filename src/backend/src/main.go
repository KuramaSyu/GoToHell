package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/gob"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

// Load environment variables and configure Discord OAuth2
func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	clientID := os.Getenv("DISCORD_CLIENT_ID")
	clientSecret := os.Getenv("DISCORD_CLIENT_SECRET")
	if clientID == "" || clientSecret == "" {
		log.Fatal("DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET is not set")
	}

	// Register User so it can be properly encoded/decoded in sessions.
	gob.Register(User{})

	discordOauthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  "http://localhost:8080/api/auth/discord/callback", // Adjust as needed
		Scopes:       []string{"identify", "email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://discord.com/api/oauth2/authorize",
			TokenURL: "https://discord.com/api/oauth2/token",
		},
	}
}

// Discord OAuth2 configuration
var discordOauthConfig = &oauth2.Config{
	ClientID:     os.Getenv("DISCORD_CLIENT_ID"),
	ClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
	RedirectURL:  os.Getenv("DISCORD_REDIRECT_URI"),
	Scopes:       []string{"identify", "email"},
	Endpoint: oauth2.Endpoint{
		AuthURL:  "https://discord.com/api/oauth2/authorize",
		TokenURL: "https://discord.com/api/oauth2/token",
	},
}

// User represents Discord user information
type User struct {
	ID            string `json:"id"`
	Username      string `json:"username"`
	Discriminator string `json:"discriminator"`
	Avatar        string `json:"avatar"`
	Email         string `json:"email"`
}

// generateState creates a cryptographically secure random string for OAuth state parameter
func generateState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func main() {
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Your frontend URL
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Set up session store using a secret from environment variables
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		log.Fatal("SESSION_SECRET environment variable is required")
	}
	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("discord_auth", store))

	// API routes
	api := r.Group("/api")
	{
		// Test route
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "pong"})
		})

		// Auth routes
		auth := api.Group("/auth")
		{
			// Start Discord OAuth login process
			auth.GET("/discord", func(c *gin.Context) {
				// Generate a random state parameter
				state, err := generateState()
				log.Printf("state: %v", state)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate state"})
					return
				}

				// Store the state in the session for verification during callback
				session := sessions.Default(c)
				session.Set("state", state)
				if err := session.Save(); err != nil {
					log.Printf("Save session failed: %v", err.Error())
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
					return
				}

				// Redirect to Discord's OAuth authorization URL
				url := discordOauthConfig.AuthCodeURL(state)
				c.Redirect(http.StatusTemporaryRedirect, url)
			})

			// OAuth callback endpoint
			auth.GET("/discord/callback", func(c *gin.Context) {
				session := sessions.Default(c)
				savedState := session.Get("state")
				queryState := c.Query("state")
				if savedState == nil || savedState != queryState {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state parameter"})
					return
				}

				// Clean up state from session
				session.Delete("state")
				session.Save()

				code := c.Query("code")
				if code == "" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found"})
					return
				}

				// Exchange the authorization code for an access token
				token, err := discordOauthConfig.Exchange(c, code)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange code for token"})
					return
				}

				// Retrieve user info from Discord using the access token
				client := discordOauthConfig.Client(c, token)
				resp, err := client.Get("https://discord.com/api/users/@me")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
					return
				}
				defer resp.Body.Close()

				var user User
				if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
					return
				}

				// Store user info in session

				session.Set("user", user)
				if err := session.Save(); err != nil {
					log.Printf("user: %v; Error: %v", user, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
					return
				}

				// Redirect to the frontend login success page
				c.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173/login-success")
			})

			// Endpoint to retrieve logged-in user info
			auth.GET("/user", func(c *gin.Context) {
				session := sessions.Default(c)
				user := session.Get("user")
				if user == nil {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Not logged in"})
					return
				}
				c.JSON(http.StatusOK, user)
			})

			// Logout endpoint to clear session data
			auth.GET("/logout", func(c *gin.Context) {
				session := sessions.Default(c)
				session.Clear()
				if err := session.Save(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear session"})
					return
				}
				c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
			})
		}
	}

	log.Printf("Discord Client ID: %v", os.Getenv("DISCORD_CLIENT_ID"))
	log.Printf("Discord Client Secret: %v", os.Getenv("DISCORD_CLIENT_SECRET"))
	// Start the server on port 8080
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
