package db

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

type Database struct {
	db *sql.DB
}

func (d *Database) InsertSport(kind string, amount int, userID uint64) error {
	query := `
	INSERT INTO sports (kind, amount, timedate, user_id)
	VALUES (?, ?, datetime('now'), ?);
	`

	_, err := d.db.Exec(query, kind, amount, userID)
	return err
}

type Sport struct {
	Kind     string `json:"kind"`
	Amount   int    `json:"amount"`
	Timedate string `json:"timedate"`
	UserID   uint64 `json:"user_id"`
}

func (d *Database) GetSports(userID uint64) ([]Sport, error) {
	query := `
	SELECT kind, amount, timedate
	FROM sports
	WHERE user_id = ?;
	`

	rows, err := d.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sports []Sport
	for rows.Next() {
		var s Sport
		if err := rows.Scan(&s.Kind, &s.Amount, &s.Timedate); err != nil {
			return nil, err
		}
		s.UserID = userID
		sports = append(sports, s)
	}

	return sports, nil
}
