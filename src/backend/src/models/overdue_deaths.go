package models

import (
	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

// SQL Table representing the users (UserID) overdue deaths (Count) for a specific game (Game).
// Game and UserID are unique, hence a composite primary key is used
// instead of a serial primary key
// swagger:model OverdueDeaths
type OverdueDeaths struct {
	UserID Snowflake `gorm:"primaryKey;autoIncrement:false" json:"user_id" example:"348922315062044675"`
	Game   string    `gorm:"primaryKey;autoIncrement:false" json:"game" example:"overwatch"`
	Count  int64     `json:"count" example:"69"`
}
