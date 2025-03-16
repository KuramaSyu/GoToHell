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

func init() {
	reader := csv.NewReader(strings.NewReader(string(defaultSportsBytes)))
	reader.Comma = ';'
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatalf("feiled to parse default_sports.csv: %v", err)
	}
	log.Printf("records: %v, len byptes: %v", records, len(defaultSportsBytes))
	DefaultSportsCsv = records
}
