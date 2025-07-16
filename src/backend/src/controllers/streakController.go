package controllers

import (
	"net/http"

	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StreakController struct {
	repo db.SportRepository
}

// NewStreakController creates a new StreakController instance
// TODO: use separate repo
func NewStreakController(DB *gorm.DB) *StreakController {
	repo := &db.OrmSportRepository{DB: DB}
	return &StreakController{repo: repo}
}

// GetDayStreak retrieves the number of days a user has been active back to back.
func (sc *StreakController) Get(c *gin.Context) {
	// Check if user is logged in via Discord
	_, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	// Read user ID from URL
	idStr := c.Param("id")
	id, err := models.NewSnowflakeFromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	streak, err := sc.repo.GetDayStreak(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": streak})
}
