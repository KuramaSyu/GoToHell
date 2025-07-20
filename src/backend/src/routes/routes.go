package routes

import (
	"github.com/KuramaSyu/GoToHell/src/backend/src/controllers"
	_ "github.com/KuramaSyu/GoToHell/src/backend/src/docs" // load docs
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter configures all application routes
func SetupRouter(
	r *gin.Engine,
	authController *controllers.AuthController,
	sportsController *controllers.SportsController,
	friendController *controllers.FriendsController,
	overdueDeathsController *controllers.OverdueDeathsController,
	streakController *controllers.StreakController,
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
		sports.PATCH("", sportsController.Patch)
		sports.DELETE("/:id", sportsController.DeleteSport)

		streak := api.Group("/streak")
		streak.GET("", streakController.Get)

		// route for friendships
		friends := api.Group("/friends")
		friends.GET("", friendController.GetFriends)
		friends.POST("", friendController.PostFriendship)
		friends.DELETE("/:id", friendController.DeleteFriendship)
		friends.PUT("", friendController.UpdateFriendship)

		// route for overdue deaths
		overdueDeaths := api.Group("/overdue-deaths")
		overdueDeaths.POST("", overdueDeathsController.Post)
		overdueDeaths.PUT("", overdueDeathsController.Put)
		overdueDeaths.DELETE("", overdueDeathsController.Delete)
		overdueDeaths.PATCH("", overdueDeathsController.Patch)
		overdueDeaths.GET("", overdueDeathsController.Get)

		// route for swagger API docs
		api.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
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
