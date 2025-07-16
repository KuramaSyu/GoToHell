package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/KuramaSyu/GoToHell/src/backend/src/config"
	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// swagger:response PostSportReply
type PostSportReply struct {
	Message string               `json:"message"`
	Results []models.SportAmount `json:"results"`
}

// swagger:response DeleteSportReply
type DeleteSportsReply struct {
	Message string `json:"message"`
}

// swagger:parameters GetSport
type GetSportReply struct {
	Data []models.Sport `json:"data"`
}

// swagger:parameters GetSportsRequest
type GetSportsRequest struct {
	// UserIDs is a comma-separated list of user IDs to filter sports by.
	UserIDs models.SnowflakeArray `form:"user_ids" binding:"required"`
	// Limit is the maximum number of sports to return.
	Limit int `form:"limit" binding:"omitempty,gte=0"`
}

// swagger:response ErrorReply
// ErrorReply is the response structure for errors.
type ErrorReply struct {
	Error string `json:"error"`
}

type SportsController struct {
	repo db.SportRepository
}

// NewSportsController creates a new auth controller
// and initializes the gorm repository.
func NewSportsController() (*SportsController, *gorm.DB) {
	repo, db := db.InitORMRepository()
	return &SportsController{repo: repo}, db
}

// Default returns a list of Sports structs based on the default CSV.
func (sc *SportsController) Default(c *gin.Context) {
	sport_map := csvToMap(config.DefaultSportsCsv)
	game_map := csvToMap(config.DefaultGamesCsv)

	response := gin.H{
		"sports": sport_map,
		"games":  game_map,
	}
	c.JSON(http.StatusOK, response)
}

func csvToMap(csv [][]string) map[string]float64 {
	m := make(map[string]float64)
	if len(csv) == 0 {
		return m
	}

	for i := 1; i < len(csv); i++ {
		row := csv[i]
		baseMultiplier, err := strconv.ParseFloat(row[1], 64)
		if err != nil {
			baseMultiplier = 1
		}
		m[row[0]] = baseMultiplier
	}
	return m
}

// GetSports retrieves sports from the database.
// Query parameters:
//   - user_id: (optional) if provided, filters sports for that user (default 0)
//   - limit: (optional) limits the number of returned sports (default all)
//
// GetSport godoc
// @Summary Get sports for all users provided in the query parameter
// @Tags 	sport
// @Accept json
// @Producte json
// @Security CookieAuth
// @Param user_ids query string true "Comma-separated list of user IDs without whitespace"
// @Param limit query int false "Limit the number of results returned, default is 50"
// @Success 200 {object} GetSportReply
// @Failure 400 {object} ErrorReply
// @Failure 500 {object} ErrorReply
// @Router /api/sports [get]
func (sc *SportsController) GetSports(c *gin.Context) {
	// Read user_id from query, defaulting to 0 if not provided.
	_, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err})
		return
	}

	var req GetSportsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("invalid JSON format: %w", err))
		return
	}

	// Update Limit parameter if not provided
	if req.Limit == 0 {
		req.Limit = 50
	}

	sports, err := sc.repo.GetSports(req.UserIDs, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
	}

	c.JSON(http.StatusOK, GetSportReply{Data: sports})
}

func (sc *SportsController) GetTotalResults(c *gin.Context) {
	// Check if user is logged in via Discord
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	amount, err := sc.repo.GetTotalAmounts(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"results": amount})
}

// PostSport godoc
// @Summary Create a sport entry
// @Tags 	sport
// @Accept	json
// @Producte json
// @Security CookieAuth
// @Param sport body []models.PostSportRequest true "Sport Payload(s)"
// @Success 201 {object} PostSportReply
// @Failure 400 {object} ErrorReply
// @Failure 500 {object} ErrorReply
// @Router /api/sports [post]
func (sc *SportsController) PostSport(c *gin.Context) {
	// Check if user is logged in via Discord
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	// Read raw request body
	body, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
		return
	}

	// Determine if the payload is an array or a single object.
	trimmed := strings.TrimSpace(string(body))
	var inputs []models.PostSportRequest
	if strings.HasPrefix(trimmed, "[") {
		// Payload is an array of SportInput
		if err := json.Unmarshal(body, &inputs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Payload is a single SportInput
		var input models.PostSportRequest
		if err := json.Unmarshal(body, &input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		inputs = append(inputs, input)
	}

	// Override UserID from the session for each sport
	// TODO: check, if timedate is allowed in overdue request table
	for _, input := range inputs {
		sport := models.Sport{
			Kind:     input.Kind,
			Game:     input.Game,
			Amount:   input.Amount,
			UserID:   user.ID,          // use the id from the session
			Timedate: time.Now().UTC(), // set to the current UTC time
		}

		if err := sc.repo.InsertSport(sport); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// fetch amount
	amount, err := sc.repo.GetTotalAmounts(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sport(s) added successfully", "results": amount})
}

// PostSport godoc
// @Summary Delete a sport entry
// @Tags 	sport
// @Accept	json
// @Producte json
// @Security CookieAuth
// @Param id path string true "Sport ID"
// @Success 201 {object} DeleteSportsReply
// @Failure 400 {object} ErrorReply
// @Failure 500 {object} ErrorReply
// @Router /api/sports [delete]
func (sc *SportsController) DeleteSport(c *gin.Context) {
	// Check if user is logged in via Discord
	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}

	// Read sport ID from URL
	idStr := c.Param("id")
	id, err := models.NewSnowflakeFromString(idStr)
	if err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	// Delete sport
	if err := sc.repo.DeleteSport(id, user.ID); err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sport deleted successfully"})
}

// GetDayStreak retrieves the number of days a user has been active back to back.
func (sc *SportsController) GetDayStreak(c *gin.Context) {
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
