package db

import "time"

type FriendshipStatus string

const (
	Pending  FriendshipStatus = "pending"
	Accepted FriendshipStatus = "accepted"
	blocked  FriendshipStatus = "blocked"
)

type Friendships struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	UserId1   uint             `json:"user_id_1"`
	UserId2   uint             `json:"user_id_2"`
	Status    FriendshipStatus `json:"status"`
	CreatedAt time.Time        `json:"created_at"`
}

type FriendshipRepository interface {
	InitRepo() error
	GetFriendships(userID uint64)
}
