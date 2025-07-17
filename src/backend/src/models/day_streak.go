package models

type DayStreak struct {
	UserID Snowflake `json:"user_id" example:"123456789012345678"`
	Days   int       `json:"days" example:"54"`
}
