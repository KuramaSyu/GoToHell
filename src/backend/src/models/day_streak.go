package models

type DayStreak struct {
	UserID Snowflake `json:"user_id"`
	Days   int       `json:"days"`
}
