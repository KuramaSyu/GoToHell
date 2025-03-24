package controllers

import (
	"encoding/json"
	"log"
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

type SportsController struct {
	repo db.Repository
}

type SportCsvContent struct {
	Sport          string  `json:"sport"`
	BaseMultiplier float64 `json:"base_multiplier"`
}

type GameCsvContent struct {
	Game           string  `json:"game"`
	BaseMultiplier float64 `json:"base_multiplier"`
}

type Sport struct {
	Kind   string `json:"kind" binding:"required"`
	Game   string `json:"game" binding:"required"`
	Amount int    `json:"amount" binding:"required"`
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
	log.Printf("responding with %v", response)
	c.JSON(http.StatusOK, response)
}

func csvToMap(csv [][]string) map[string]float64 {
	m := make(map[string]float64)
	if len(csv) == 0 {
		return m
	}

	for i := 1; i < len(csv); i++ {
		row := csv[i]
		log.Printf("%v", row)
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
//   - amount: (optional) limits the number of returned sports (default all)
func (sc *SportsController) GetSports(c *gin.Context) {
	// Read user_id from query, defaulting to 0 if not provided.
	userIdList := c.Query("user_ids")
	_, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err})
		return
	}
	user_ids := make([]models.Snowflake, 0)
	if userIdList != "" {
		userIdStrs := strings.Split(userIdList, ",")
		for _, userIdStr := range userIdStrs {
			userId, err := models.NewSnowflakeFromString(userIdStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
				return
			}
			user_ids = append(user_ids, userId)
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No user ID provided"})
		return
	}

	sports, err := sc.repo.GetSports(user_ids)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
	}
	// Limit result if "amount" query parameter is provided.
	amountStr := c.Query("amount")
	if amountStr != "" {
		amount, err := strconv.Atoi(amountStr)
		if err != nil || amount < 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount parameter"})
			return
		}
		if amount < len(sports) {
			sports = sports[:amount]
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": sports})
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

// PostSport accepts a JSON payload for one or multiple sports and stores them using the repo.
// since the app will directly after this, ask for the total amount, this will
// be returned as well in "result" or an error message in "error"
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
	var inputs []Sport
	if strings.HasPrefix(trimmed, "[") {
		// Payload is an array of SportInput
		if err := json.Unmarshal(body, &inputs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Payload is a single SportInput
		var input Sport
		if err := json.Unmarshal(body, &input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		inputs = append(inputs, input)
	}

	// Override UserID from the session for each sport
	for _, input := range inputs {
		sport := db.Sport{
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
		c.JSON(http.StatusOK, gin.H{"message": "Sport(s) added successfully", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sport(s) added successfully", "results": amount})
}

// DeleteSport removes a sport from the database.
func (sc *SportsController) DeleteSport(c *gin.Context) {
	// Check if user is logged in via Discord
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	// Read sport ID from URL
	idStr := c.Param("id")
	id, err := models.NewSnowflakeFromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sport ID"})
		return
	}

	// Check if sport exists and belongs to the user
	user_ids := append(make([]models.Snowflake, 0, 5), user.ID)
	sports, err := sc.repo.GetSports(user_ids)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var sportExists bool
	for _, sport := range sports {
		if sport.ID == id {
			sportExists = true
			break
		}
	}
	if !sportExists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	// Delete sport
	if err := sc.repo.DeleteSport(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sport deleted successfully"})
}
