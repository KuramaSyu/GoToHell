package controllers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/KuramaSyu/GoToHell/src/backend/src/config"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

// AuthController handles authentication logic
type AuthController struct {
	OAuthConfig *oauth2.Config
}

// NewAuthController creates a new auth controller
func NewAuthController(oauthConfig *oauth2.Config) *AuthController {
	return &AuthController{
		OAuthConfig: oauthConfig,
	}
}

// retrieves the user  by Context and session
func UserFromSession(c *gin.Context) (*models.User, int, error) {
	session := sessions.Default(c)
	userData := session.Get("user")
	if userData == nil {
		return nil, http.StatusUnauthorized, fmt.Errorf("not logged in")
	}

	user_go, ok := userData.(models.User)
	if !ok {
		return nil, http.StatusInternalServerError, fmt.Errorf("wrong user format: %v %v", userData, ok)
	}

	return &user_go, http.StatusOK, nil
}

// GenerateState creates a random state string for OAuth
func (ac *AuthController) GenerateState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// Login initiates Discord OAuth flow
func (ac *AuthController) Login(c *gin.Context) {
	state, err := ac.GenerateState()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate state"})
		return
	}

	session := sessions.Default(c)
	session.Set("state", state)
	if err := session.Save(); err != nil {
		log.Printf("Save session failed: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	url := ac.OAuthConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// Callback handles OAuth callback from Discord
func (ac *AuthController) Callback(c *gin.Context) {
	session := sessions.Default(c)
	savedState := session.Get("state")
	queryState := c.Query("state")

	if savedState == nil || savedState != queryState {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state parameter"})
		return
	}

	session.Delete("state")
	session.Save()

	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found"})
		return
	}

	token, err := ac.OAuthConfig.Exchange(c, code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange code for token"})
		return
	}

	client := ac.OAuthConfig.Client(c, token)
	resp, err := client.Get("https://discord.com/api/users/@me")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var d_user models.JsUser
	if err := json.NewDecoder(resp.Body).Decode(&d_user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}
	user, err := d_user.Parse()
	log.Printf("User: %v", user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID was not parsable to int"})
	}

	session.Set("user", *user)
	if err := session.Save(); err != nil {
		log.Printf("user: %v; Error: %v", user, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}
	redirect_url := fmt.Sprintf("%v", config.AppConfig.FrontendURL)
	c.Redirect(http.StatusTemporaryRedirect, redirect_url)
}

// GetUser returns the current authenticated user
func (ac *AuthController) GetUser(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not logged in"})
		return
	}
	user_go := user.(models.User)
	c.JSON(http.StatusOK, user_go.ParseJS())
}

// Logout clears the user session
func (ac *AuthController) Logout(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
