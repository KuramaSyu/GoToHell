package routes

import (
	"github.com/KuramaSyu/GoToHell/src/backend/src/controllers"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all application routes
func SetupRouter(
	r *gin.Engine,
	authController *controllers.AuthController,
	sportsController *controllers.SportsController,
) {
	// API routes
	api := r.Group("/api")

	// Test route
	api.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// route for default sports table
	api.GET("/default", sportsController.Default)
	api.GET("/sports", sportsController.GetSports)
	api.GET("/sports/total", sportsController.GetTotalResults)
	api.POST("/sports", sportsController.PostSport)
	api.DELETE("/sports/:id", sportsController.DeleteSport)
	// Auth routes
	auth := api.Group("/auth")
	{
		auth.GET("/discord", authController.Login)
		auth.GET("/discord/callback", authController.Callback)
		auth.GET("/user", authController.GetUser)
		auth.GET("/logout", authController.Logout)
	}
}
