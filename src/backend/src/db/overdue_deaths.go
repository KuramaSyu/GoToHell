package db

import (
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/gorm"
)

// Specific implementation of `OverdueDeathRepository` for GORM
type GormOverdueDeathsRepository struct {
	db *gorm.DB
}

// automigrates the OverdueDeaths GORM table
func (r *GormOverdueDeathsRepository) initRepo() {
	r.db.AutoMigrate(&OverdueDeaths{})
}

// Inserts or updates a OverdueDeaths record in the DB.
func (r *GormOverdueDeathsRepository) SetCount(userID Snowflake, game string, count int64) (*OverdueDeaths, error) {
	var overdueDeaths = OverdueDeaths{
		UserID: userID,
		Game:   game,
		Count:  count,
	}
	err := r.db.Save(overdueDeaths).Error
	if err != nil {
		return nil, err
	}
	return &overdueDeaths, err
}

// Returns a list with all OverdueDeaths records for the given user
func (r *GormOverdueDeathsRepository) FetchAll(userID Snowflake) ([]OverdueDeaths, error) {
	var overdueDeaths []OverdueDeaths
	err := r.db.Where(&OverdueDeaths{UserID: userID}).Find(&overdueDeaths).Error
	return overdueDeaths, err
}
