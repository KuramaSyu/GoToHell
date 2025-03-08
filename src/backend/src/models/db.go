package models

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

func InitDB() *sql.DB {
	// Open (or create) SQLite database
	db, err := sql.Open("sqlite3", "go-to-hell.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create table on startup
	createSportsTable(db)

	fmt.Println("Database initialized and 'sports' table created successfully.")
	return db
}

func createSportsTable(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS sports (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		kind TEXT NOT NULL,
		amount INTEGER NOT NULL,
		timedate TEXT NOT NULL,
		user_id BIGINT NOT NULL
	);
	`

	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create 'sports' table:", err)
	}
}
