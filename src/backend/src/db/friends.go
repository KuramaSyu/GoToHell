package db

import (
	"fmt"
	"time"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/gorm"
)

type FriendshipStatus string

const (
	Pending  FriendshipStatus = "pending"
	Accepted FriendshipStatus = "accepted"
	blocked  FriendshipStatus = "blocked"
)

type Friendships struct {
	ID          Snowflake        `gorm:"primaryKey" json:"id"`
	RequesterID Snowflake        `json:"requester_id"`
	RecipientID Snowflake        `json:"recipient_id"`
	Status      FriendshipStatus `json:"status"`
	CreatedAt   time.Time        `json:"created_at"`
}

type FriendshipRepository interface {
	InitRepo() error
	GetFriendships(userID Snowflake) ([]Friendships, error)
	CreateFriendship(requesterID Snowflake, recipientID Snowflake, status FriendshipStatus) error
	UpdateFriendship(friendshipID Snowflake, userID Snowflake, status FriendshipStatus) error
	DeleteFriendship(friendshipID Snowflake) error
}

type GormFriendshipRepository struct {
	DB *gorm.DB
}

func NewGormFriendshipRepository(db *gorm.DB) FriendshipRepository {
	repo := &GormFriendshipRepository{DB: db}
	repo.InitRepo()
	return repo
}

// InitRepo performs auto migration for the Friendships model.
func (r *GormFriendshipRepository) InitRepo() error {
	return r.DB.AutoMigrate(&Friendships{})
}

// GetFriendships retrieves all friendships where the given user is involved.
func (r *GormFriendshipRepository) GetFriendships(userID Snowflake) ([]Friendships, error) {
	var friendships []Friendships
	if err := r.DB.
		Where("requester_id = ? OR recipient_id = ?", userID, userID).
		Find(&friendships).Error; err != nil {
		return nil, err
	}
	return friendships, nil
}

// CreateFriendship creates a new friendship entry.
func (r *GormFriendshipRepository) CreateFriendship(requesterID Snowflake, recipientID Snowflake, status FriendshipStatus) error {
	friendship := Friendships{
		RequesterID: Snowflake(requesterID),
		RecipientID: Snowflake(recipientID),
		Status:      status,
		CreatedAt:   time.Now(),
	}
	return r.DB.Create(&friendship).Error
}

// UpdateFriendship updates the status of an existing friendship.
func (r *GormFriendshipRepository) UpdateFriendship(friendshipID Snowflake, userID Snowflake, status FriendshipStatus) error {
	var friendships []Friendships
	if err := r.DB.Find(&friendships).Error; err != nil {
		return err
	}

	for _, friendship := range friendships {
		fmt.Printf("ID: %d, RequesterID: %d, RecipientID: %d, Status: %s, CreatedAt: %s\n",
			friendship.ID, friendship.RequesterID, friendship.RecipientID, friendship.Status, friendship.CreatedAt)
	}

	var friendship Friendships
	if err := r.DB.First(&friendship, friendshipID).Error; err != nil {
		return err
	}

	// Check if the status update is allowed.
	if status == Accepted {
		// Only the recipient can accept the friend request.
		if friendship.RecipientID != userID {
			return fmt.Errorf("user %d is not authorized to accept this request for user %d", userID, friendship.RecipientID)
		}
	}

	// Update the status.
	friendship.Status = status
	return r.DB.Save(&friendship).Error

}

// DeleteFriendship deletes a friendship record.
func (r *GormFriendshipRepository) DeleteFriendship(friendshipID Snowflake) error {
	return r.DB.Delete(&Friendships{}, friendshipID).Error
}
