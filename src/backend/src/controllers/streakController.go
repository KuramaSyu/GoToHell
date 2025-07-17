package controllers

import (
	"fmt"
	"net/http"

	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// swagger:parameters GetStreakQuery
type GetStreakQuery struct {
	// UserIDs is a comma-separated list of user IDs to filter streaks by
	UserIDs models.SnowflakeArray `form:"user_ids" binding:"required" example:"123456789012345678,234567890123456789"`
}

// swagger:response GetStreakReply
type GetStreakReply struct {
	// Data contains the streak information for the user
	Data []models.DayStreak `json:"data"`
}

type StreakController struct {
	repo db.SportRepository
}

// NewStreakController creates a new StreakController instance
// TODO: use separate repo
func NewStreakController(DB *gorm.DB) *StreakController {
	repo := &db.OrmSportRepository{DB: DB}
	return &StreakController{repo: repo}
}

// @Summary retrieves the number of days a user has been active back to back
// @Tags streak
// @Security CookieAuth
// @Produce json
// @Param user_ids path string true "Comma-separated list of user IDs without spaces"
// @Success 200 {object} GetStreakReply
// @Failure 400 {object} ErrorReply
// @Failure 500 {object} ErrorReply
// @Router /streak/{user_ids} [get]
func (sc *StreakController) Get(c *gin.Context) {
	// Check if user is logged in via Discord
	_, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	req := GetStreakQuery{}

	// Read user ID from URL
	idStr := c.Param("user_ids")

	// bind IDs to the request
	if err = req.UserIDs.UnmarshalText([]byte(idStr)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user IDs"})
		return
	}

	if len(req.UserIDs.IDs) == 0 {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("no user IDs provided"))
		return
	}

	streaks := make([]models.DayStreak, len(req.UserIDs.IDs))
	for i, id := range req.UserIDs.IDs {
		streak, err := sc.repo.GetDayStreak(id)
		if err != nil {
			SetGinError(c, http.StatusInternalServerError, fmt.Errorf("failed to get streak for user %s: %w", id, err))
			return
		}
		streaks[i] = streak
	}
	c.JSON(http.StatusOK, GetStreakReply{Data: streaks})
}
