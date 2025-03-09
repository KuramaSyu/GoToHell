package controllers

import (
	"encoding/csv"
	"net/http"
	"os"
	"strconv" // added import

	"github.com/gin-gonic/gin"
)

type SportsController struct{}

type Sport struct {
	Kind            string  `json:"kind"`
	Game            string  `json:"game"`
	DeathMultiplier float64 `json:"death_multiplier"`
}

// NewSportsController creates a new auth controller
func NewSportsController() *SportsController {
	return &SportsController{}
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
		return gin.H{"data": []Sport{}}
	}

	sports := make([]Sport, 0, len(csv)-1)
	for i := 1; i < len(csv); i++ {
		row := csv[i]
		if len(row) < 3 {
			continue
		}
		deathMultiplier, err := strconv.ParseFloat(row[2], 64)
		if err != nil {
			deathMultiplier = 1
		}
		sports = append(sports, Sport{
			Kind:            row[0],
			Game:            row[1],
			DeathMultiplier: deathMultiplier,
		})
	}
	return gin.H{"data": sports}
}
