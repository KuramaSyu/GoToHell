package db

import (
	"errors"

	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	InitRepo() error
	GetUserByID(id models.Snowflake) (*models.User, error)
	CreateUser(user *models.User) error
	UpdateUser(user *models.User) error
	DeleteUserByID(id models.Snowflake) error
}

type GormUserRepository struct {
	DB *gorm.DB
}

func NewGormUserRepository(db *gorm.DB) UserRepository {
	repo := &GormUserRepository{DB: db}
	repo.InitRepo()
	return repo
}

// InitRepo performs auto migration for the User model.
func (r *GormUserRepository) InitRepo() error {
	return r.DB.AutoMigrate(&models.User{})
}

// GetUserByID retrieves a user by its ID.
func (r *GormUserRepository) GetUserByID(id models.Snowflake) (*models.User, error) {
	var user models.User
	if err := r.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// CreateUser creates a new user record.
func (r *GormUserRepository) CreateUser(user *models.User) error {
	var existing models.User
	// Try to find the user by primary key (ID)
	if err := r.DB.First(&existing, user.ID).Error; err == nil {
		// User exists, update record
		return r.DB.Save(user).Error
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// User does not exist, create a new record
		return r.DB.Create(user).Error
	} else {
		// An error occurred during lookup
		return err
	}
}

// UpdateUser updates an existing user record.
func (r *GormUserRepository) UpdateUser(user *models.User) error {
	if user.ID == 0 {
		return errors.New("invalid user id")
	}
	return r.DB.Save(user).Error
}

// DeleteUserByID deletes a user by its ID.
func (r *GormUserRepository) DeleteUserByID(id models.Snowflake) error {
	return r.DB.Delete(&models.User{}, id).Error
}
