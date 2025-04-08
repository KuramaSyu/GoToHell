package config

import (
	_ "embed"
	"encoding/csv"
	"log"
	"strings"
)

//go:embed default_sports.csv
var defaultSportsBytes []byte

var DefaultSportsCsv [][]string

//go:embed default_games.csv
var defaultGamesBytes []byte

var DefaultGamesCsv [][]string

func init() {
	reader := csv.NewReader(strings.NewReader(string(defaultSportsBytes)))
	reader.Comma = ','
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatalf("feiled to parse default_sports.csv: %v", err)
	}
	DefaultSportsCsv = records

	reader = csv.NewReader(strings.NewReader(string(defaultGamesBytes)))
	reader.Comma = ','
	records, err = reader.ReadAll()
	if err != nil {
		log.Fatalf("feiled to parse default_games.csv: %v", err)
	}
	DefaultGamesCsv = records
}
