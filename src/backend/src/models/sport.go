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
// swagger:model PostSportRequest
type PostSportRequest struct {
	// Kind of the sport
	Kind string `json:"kind" binding:"required" example:"push-up"`

	// The Game, this sport-record belongs to
	Game string `json:"game" binding:"required" example:"overwatch"`

	// The amount of Exercises done
	Amount int `json:"amount" binding:"required" example:"42"`

	// when the sport was done as UTC time - currently set by the API
	Timedate time.Time `json:"timedate,omitempty" example:"1751897680.372402"`

	// ID of the user, who did the sport - currently set by the API
	ID Snowflake `json:"id,omitempty"`
}
