package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

// Config holds application configuration
type Config struct {
	DiscordOAuthConfig *oauth2.Config
	SessionSecret      string
	FrontendURL        string
}

// Load initializes configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	clientID := os.Getenv("DISCORD_CLIENT_ID")
	clientSecret := os.Getenv("DISCORD_CLIENT_SECRET")
	redirectURL := os.Getenv("DISCORD_REDIRECT_URI")
	sessionSecret := os.Getenv("SESSION_SECRET")
	frontendURL := os.Getenv("FRONTEND_URL")

	if clientID == "" || clientSecret == "" {
		log.Fatal("DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET is not set")
	}

	if sessionSecret == "" {
		log.Fatal("SESSION_SECRET environment variable is required")
	}

	if redirectURL == "" {
		redirectURL = "http://localhost:8080/api/auth/discord/callback"
	}

	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	discordOAuthConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"identify", "email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://discord.com/api/oauth2/authorize",
			TokenURL: "https://discord.com/api/oauth2/token",
		},
	}

	return &Config{
		DiscordOAuthConfig: discordOAuthConfig,
		SessionSecret:      sessionSecret,
		FrontendURL:        frontendURL,
	}
}
