package db

import (
	"time"

	"gorm.io/gorm"
)

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
	GetFriendships(userID uint) ([]Friendships, error)
	CreateFriendship(userID_1 uint, userID_2 uint, status FriendshipStatus) error
	UpdateFriendship(friendshipID uint, status FriendshipStatus) error
	DeleteFriendship(friendshipID uint) error
}

type GormFriendshipRepository struct {
	DB *gorm.DB
}

func NewGormFriendshipRepository(db *gorm.DB) FriendshipRepository {
	return &GormFriendshipRepository{DB: db}
}

// InitRepo performs auto migration for the Friendships model.
func (r *GormFriendshipRepository) InitRepo() error {
	return r.DB.AutoMigrate(&Friendships{})
}

// GetFriendships retrieves all friendships where the given user is involved.
func (r *GormFriendshipRepository) GetFriendships(userID uint) ([]Friendships, error) {
	var friendships []Friendships
	if err := r.DB.
		Where("user_id_1 = ? OR user_id_2 = ?", userID, userID).
		Find(&friendships).Error; err != nil {
		return nil, err
	}
	return friendships, nil
}

// CreateFriendship creates a new friendship entry.
func (r *GormFriendshipRepository) CreateFriendship(userID_1 uint, userID_2 uint, status FriendshipStatus) error {
	friendship := Friendships{
		UserId1:   uint(userID_1),
		UserId2:   uint(userID_2),
		Status:    status,
		CreatedAt: time.Now(),
	}
	return r.DB.Create(&friendship).Error
}

// UpdateFriendship updates the status of an existing friendship.
func (r *GormFriendshipRepository) UpdateFriendship(friendshipID uint, status FriendshipStatus) error {
	return r.DB.Model(&Friendships{}).
		Where("id = ?", friendshipID).
		Update("status", status).Error
}

// DeleteFriendship deletes a friendship record.
func (r *GormFriendshipRepository) DeleteFriendship(friendshipID uint) error {
	return r.DB.Delete(&Friendships{}, friendshipID).Error
}
