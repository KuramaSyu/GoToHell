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
	friendController *controllers.FriendsController,
) {

	// API routes
	api := r.Group("/api")
	{
		// Test route
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong"})
		})

		api.GET("/default", sportsController.Default)

		// route for sport
		sports := api.Group("/sports")
		sports.GET("", sportsController.GetSports)
		sports.GET("/total", sportsController.GetTotalResults)
		sports.POST("", sportsController.PostSport)
		sports.DELETE("/:id", sportsController.DeleteSport)
		sports.GET("/streak/:id", sportsController.GetDayStreak)

		// route for friendships
		friends := api.Group("/friends")
		friends.GET("", friendController.GetFriends)
		friends.POST("", friendController.PostFriendship)
		friends.DELETE("/:id", friendController.DeleteFriendship)
		friends.PUT("", friendController.UpdateFriendship)
	}

	// Auth routes
	auth := api.Group("/auth")
	{
		auth.GET("/discord", authController.Login)
		auth.GET("/discord/callback", authController.Callback)
		auth.GET("/user", authController.GetUser)
		auth.GET("/logout", authController.Logout)
	}
}
