package models

import (
	"time"
)

type FriendshipStatus string

const (
	Pending  FriendshipStatus = "pending"
	Accepted FriendshipStatus = "accepted"
	Blocked  FriendshipStatus = "blocked"
)

// SQL Table representing a friendship between person A <RequesterID> and person B <RecipientID>.
// The status <Status> of the friendship is either pending, accepted or blocked
type Friendships struct {
	ID          Snowflake        `gorm:"primaryKey" json:"id"`
	RequesterID Snowflake        `json:"requester_id"`
	RecipientID Snowflake        `json:"recipient_id"`
	Status      FriendshipStatus `json:"status"`
	CreatedAt   time.Time        `json:"created_at"`
}
