package db

import (
	"fmt"
	"log"
	"time"

	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Sport struct {
	ID       Snowflake `gorm:"primaryKey" json:"id"`
	Kind     string    `json:"kind"`
	Amount   int       `json:"amount"`
	Timedate time.Time `json:"timedate"`
	UserID   Snowflake `json:"user_id"`
	Game     string    `json:"game"`
}

// Updated Repository interface to include full CRUD operations using the Sport struct.
type Repository interface {
	InsertSport(sport Sport) error
	GetSports(userIDs []Snowflake) ([]Sport, error)
	UpdateSport(sport Sport) error
	DeleteSport(id Snowflake) error
	GetTotalAmounts(userID Snowflake) ([]models.SportAmount, error)
}

// Define ORMRepository using GORM.
type ORMRepository struct {
	DB *gorm.DB
}

// InitORMRepository initializes GORM DB connection and auto-migrates the Sport model.
func InitORMRepository() (*ORMRepository, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open("./db/go-to-hell.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}
	// Auto migrate Sport model.
	if err := db.AutoMigrate(&Sport{}); err != nil {
		log.Fatal("failed to migrate:", err)
	}
	fmt.Println("ORM Database initialized and migrated.")
	return &ORMRepository{DB: db}, db
}

// InsertSport adds a new Sport entry using ORM.
func (r *ORMRepository) InsertSport(sport Sport) error {
	result := r.DB.Create(&sport)
	return result.Error
}

// GetSports retrieves Sport entries for any of the provided userIDs.
// Now checks that user_id is any of the slice values and limits the result to 50.
func (r *ORMRepository) GetSports(userIDs []Snowflake) ([]Sport, error) {
	var sports []Sport
	result := r.DB.Where("user_id IN (?)", userIDs).Limit(50).Find(&sports)
	return sports, result.Error
}

// Sum all amounts from a given user and group it by sport kind
func (r *ORMRepository) GetTotalAmounts(userID Snowflake) ([]models.SportAmount, error) {
	var results []models.SportAmount
	result := r.DB.Model(&Sport{}).Select("kind, sum(amount) as amount").Where("user_id = ?", userID).Group("kind").Scan(&results)
	if result.Error != nil {
		return nil, result.Error
	}

	return results, nil
}

// UpdateSport updates a Sport entry using ORM.
func (r *ORMRepository) UpdateSport(sport Sport) error {
	result := r.DB.Save(&sport)
	return result.Error
}

// DeleteSport removes a Sport entry by ID using ORM.
func (r *ORMRepository) DeleteSport(id Snowflake) error {
	result := r.DB.Delete(&Sport{}, id)
	return result.Error
}
