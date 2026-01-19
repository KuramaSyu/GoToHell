package db

import (
	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/gorm"
)

// PersonalGoalsRepository defines the interface for managing personal goals in the database.
func NewPersonalGoalsRepository(database *gorm.DB, friendship_repo *FriendshipRepository) *GormPersonalGoalsRepository {
	repo := &GormPersonalGoalsRepository{DB: database}
	repo.InitRepo()
	return repo
}

// Specific implementation of `OverdueDeathRepository` for GORM
type GormPersonalGoalsRepository struct {
	DB              *gorm.DB
	friendship_repo *FriendshipRepository
}

// automigrates the OverdueDeaths GORM table
func (r *GormPersonalGoalsRepository) InitRepo() error {
	return r.DB.AutoMigrate(&PersonalGoal{})
}

// Inserts or updates a PersonalGoal record in the DB.
func (r *GormPersonalGoalsRepository) Insert(goal *PersonalGoal) (*PersonalGoal, error) {
	err := r.DB.Save(goal).Error
	if err != nil {
		return nil, err
	}
	return goal, err
}

// Updates a PersonalGoal record in the DB.
func (r *GormPersonalGoalsRepository) Update(goal *PersonalGoal) (*PersonalGoal, error) {
	err := r.DB.Where(PersonalGoal{}, &PersonalGoal{UserID: goal.UserID}).Updates(&goal).Error
	if err != nil {
		return nil, err
	}
	return goal, err
}

// Fetches PersonalGoal by UserID
func (r *GormPersonalGoalsRepository) FetchByUserID(userID Snowflake, requester Snowflake) ([]PersonalGoal, error) {
	var goals []PersonalGoal
	// check if requester asks for their own goals
	var check = userID == requester
	if !check {
		// check if requester asks for a friend's goals
		var friendship db.FriendshipRepository

	}
	err := r.DB.Where(&PersonalGoal{UserID: userID}).Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

// Deletes a PersonalGoal by its ID.
func (r *GormPersonalGoalsRepository) DeleteByID(goalID Snowflake) error {
	return r.DB.Where(&PersonalGoal{ID: goalID}).Delete(&PersonalGoal{}).Error
}
