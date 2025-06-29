package db

import (
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

// SQL Table representing the users (UserID) overdue deaths (Count) for a specific game (Game).
// Game and UserID are unique, hence a composite primary key is used
// instead of a serial primary key
type OverdueDeaths struct {
	UserID Snowflake `gorm:"primaryKey;autoIncrement:false" json:"user_id"`
	Game   string    `gorm:"primaryKey;autoIncrement:false" json:"game"`
	Count  int64     `json:"count"`
}
