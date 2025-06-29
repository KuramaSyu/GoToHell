package models

import (
	"time"
)

// SQL table represeting the sport of <Kind> a user <UserID> has done in
// a <Game> to a specific time <Timedate> with a given amount of exercises <Amount>
type Sport struct {
	ID       Snowflake `gorm:"primaryKey" json:"id"`
	Kind     string    `json:"kind"`
	Amount   int       `json:"amount"`
	Timedate time.Time `json:"timedate"`
	UserID   Snowflake `json:"user_id"`
	Game     string    `json:"game"`
}

// Row which is sent by the user. The rest will be added from
// the API
type PartialSport struct {
	Kind     string    `json:"kind" binding:"required"`
	Game     string    `json:"game" binding:"required"`
	Amount   int       `json:"amount" binding:"required"`
	Timedate time.Time `json:"timedate,omitempty"`
	ID       Snowflake `json:"id,omitempty"`
}
