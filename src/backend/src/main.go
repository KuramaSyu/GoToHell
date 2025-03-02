package main

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

// Discord OAuth2 configuration
var discordOauthConfig = &oauth2.Config{
	ClientID:     os.Getenv("DISCORD_CLIENT_ID"),
	ClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
	RedirectURL:  "http://localhost:8080/api/auth/discord/callback", // Adjust as needed
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

func main() {
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Your frontend URL
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Set up session store
	store := cookie.NewStore([]byte("secret")) // Use a secure secret in production
	r.Use(sessions.Sessions("discord_auth", store))

	// API routes
	api := r.Group("/api")
	{
		// Test route
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong"})
		})

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.GET("/discord", func(c *gin.Context) {
				// Generate state parameter to prevent CSRF
				state := "random-state" // Use a proper random value in production

				// Store state in session
				session := sessions.Default(c)
				session.Set("state", state)
				session.Save()

				// Redirect to Discord OAuth authorization URL
				url := discordOauthConfig.AuthCodeURL(state)
				c.Redirect(http.StatusTemporaryRedirect, url)
			})

			auth.GET("/discord/callback", func(c *gin.Context) {
				// Verify state parameter
				session := sessions.Default(c)
				state := session.Get("state")

				if state != c.Query("state") {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state parameter"})
					return
				}

				// Exchange authorization code for token
				code := c.Query("code")
				token, err := discordOauthConfig.Exchange(c, code)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange code for token"})
					return
				}

				// Get user info from Discord
				client := discordOauthConfig.Client(c, token)
				resp, err := client.Get("https://discord.com/api/users/@me")
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
					return
				}
				defer resp.Body.Close()

				var user User
				err = json.NewDecoder(resp.Body).Decode(&user)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
					return
				}

				// Store user info in session
				session.Set("user", user)
				session.Save()

				// Redirect back to the frontend
				c.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173/login-success")
			})

			auth.GET("/user", func(c *gin.Context) {
				session := sessions.Default(c)
				user := session.Get("user")

				if user == nil {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Not logged in"})
					return
				}

				c.JSON(http.StatusOK, user)
			})

			auth.GET("/logout", func(c *gin.Context) {
				session := sessions.Default(c)
				session.Clear()
				session.Save()
				c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
			})
		}
	}
	// Run on port 8080
	r.Run(":8080")
}
