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
	"github.com/gin-gonic/gin"
)

type SportsController struct {
	repo db.Repository
}

type SportTable struct {
	Kind            string  `json:"kind"`
	Game            string  `json:"game"`
	DeathMultiplier float64 `json:"death_multiplier"`
}

type Sport struct {
	Kind   string `json:"kind" binding:"required"`
	Game   string `json:"game" binding:"required"`
	Amount int    `json:"amount" binding:"required"`
}

// NewSportsController creates a new auth controller
// and initializes the gorm repository.
func NewSportsController() *SportsController {
	repo := db.InitORMRepository()
	return &SportsController{repo: repo}
}

// Default returns a list of Sports structs based on the default CSV.
func (sc *SportsController) Default(c *gin.Context) {
	c.JSON(http.StatusOK, csvToSports(config.DefaultSportsCsv))
}

// csvToSports converts CSV data to a JSON structure of Sports.
// Assumes the first row contains headers and that the CSV columns are:
// [kind, game, death_multiplier]
func csvToSports(csv [][]string) gin.H {
	if len(csv) == 0 {
		return gin.H{"data": []SportTable{}}
	}

	sports := make([]SportTable, 0, len(csv)-1)
	for i := 1; i < len(csv); i++ {
		row := csv[i]
		if len(row) < 3 {
			continue
		}
		deathMultiplier, err := strconv.ParseFloat(row[2], 64)
		if err != nil {
			deathMultiplier = 1
		}
		sports = append(sports, SportTable{
			Kind:            row[0],
			Game:            row[1],
			DeathMultiplier: deathMultiplier,
		})
	}
	return gin.H{"data": sports}
}

// GetSports retrieves sports from the database.
// Query parameters:
//   - user_id: (optional) if provided, filters sports for that user (default 0)
//   - amount: (optional) limits the number of returned sports (default all)
func (sc *SportsController) GetSports(c *gin.Context) {
	// Read user_id from query, defaulting to 0 if not provided.
	userIDStr := c.Query("user_id")
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err})
		return
	}

	if fmt.Sprint(user.ID) != userIDStr {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only fetch your data"})
		return
	}

	sports, err := sc.repo.GetSports(user.ID)
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
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sport ID"})
		return
	}

	// Check if sport exists and belongs to the user
	sports, err := sc.repo.GetSports(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var sportExists bool
	for _, sport := range sports {
		if sport.ID == uint(id) {
			sportExists = true
			break
		}
	}
	if !sportExists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	// Delete sport
	if err := sc.repo.DeleteSport(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sport deleted successfully"})
}
