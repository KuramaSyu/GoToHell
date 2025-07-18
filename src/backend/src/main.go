// @title GoToHell Gin REST API
// @oversion 1.0
// @description Provides all methods to persist data for GoToHell
// @securityDefinitions.apikey CookieAuth
// @in cookie
// @name discord_auth

package main

import (
	"encoding/gob"
	"log"

	"github.com/KuramaSyu/GoToHell/src/backend/src/config"
	"github.com/KuramaSyu/GoToHell/src/backend/src/controllers"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/KuramaSyu/GoToHell/src/backend/src/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func init() {
	// Register types for session storage
	gob.Register(models.User{})
}

func main() {
	// Load configuration
	appConfig := config.Load()

	// Create router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{appConfig.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Setup sessions
	store := cookie.NewStore([]byte(appConfig.SessionSecret))
	r.Use(sessions.Sessions("discord_auth", store))

	// Initialize controllers
	sportsController, db := controllers.NewSportsController()
	authController := controllers.NewAuthController(appConfig.DiscordOAuthConfig, db)
	friendsController := controllers.NewFriendsController(db)
	overdueDeathController := controllers.NewOverdueDeathsController(db)
	streakController := controllers.NewStreakController(db)
	// Setup routes
	routes.SetupRouter(
		r,
		authController,
		sportsController,
		friendsController,
		overdueDeathController,
		streakController,
	)

	// Start the server
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
