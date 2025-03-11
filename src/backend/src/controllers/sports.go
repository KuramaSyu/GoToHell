package controllers

import (
	"encoding/csv"
	"encoding/json"
	"net/http"
	"os"
	"strconv" // added import
	"strings"

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
	UserID uint64 `json:"user_id" binding:"required"`
}

// NewSportsController creates a new auth controller
func NewSportsController() *SportsController {
	repo := db.InitORMRepository()
	return &SportsController{repo: repo}
}

// Default returns a list of Sports structs based on the default CSV.
func (sc *SportsController) Default(c *gin.Context) {
	file, err := os.Open("config/default_sports.csv")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = ';'
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Updated conversion from CSV to list of Sports structs.
	c.JSON(http.StatusOK, csvToSports(records))
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
	var userID uint64 = 0
	if userIDStr != "" {
		parsed, err := strconv.ParseUint(userIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
			return
		}
		userID = parsed
	}

	sports, err := sc.repo.GetSports(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

// PostSport accepts a JSON payload for one or multiple sports and stores them using the repo.
func (sc *SportsController) PostSport(c *gin.Context) {
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

	// Insert each sport using the repo.
	for _, input := range inputs {
		sport := db.Sport{
			Kind:     input.Kind,
			Game:     input.Game,
			Amount:   input.Amount,
			UserID:   input.UserID,
			Timedate: "", // Optionally, set a current timestamp if needed
		}

		if err := sc.repo.InsertSport(sport); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sport(s) added successfully"})
}
