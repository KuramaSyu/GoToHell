package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Test route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	// Run on port 8080
	r.Run(":8080")
}
