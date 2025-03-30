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

type DayStreak struct {
	UserID Snowflake `json:"user_id"`
	Days   int       `json:"days"`
}

// Updated Repository interface to include full CRUD operations using the Sport struct.
type Repository interface {
	InsertSport(sport Sport) error
	GetSports(userIDs []Snowflake) ([]Sport, error)
	UpdateSport(sport Sport) error
	DeleteSport(id Snowflake) error
	GetTotalAmounts(userID Snowflake) ([]models.SportAmount, error)
	GetDayStreak(userID Snowflake) (DayStreak, error)
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
	result := r.DB.
		Where("user_id IN (?)", userIDs).
		Order("timedate desc").
		Limit(50).
		Find(&sports)
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

// GetDayStreak retrieves the amount of days a user has been active back to back.
func (r *ORMRepository) GetDayStreak(userID Snowflake) (DayStreak, error) {
	var dayStreak DayStreak
	var activityDates []string

	// Query to get all distinct activity dates for the user, ordered by date descending
	result := r.DB.Model(&Sport{}).
		Select("DISTINCT DATE(timedate) as date").
		Where("user_id = ? AND timedate IS NOT NULL AND timedate > ?", userID, "2000-01-01").
		Order("DATE(timedate) DESC").
		Pluck("date", &activityDates)

	if result.Error != nil {
		return dayStreak, result.Error
	}

	// count the days from now
	streak := 0
	dayOffset := 0
	for i, date_str := range activityDates {
		// parse date to time.Time
		date, err := time.Parse("2006-01-02", date_str)
		if err != nil {
			return dayStreak, err
		}

		if i == 0 {
			// check if date is today
			if date.Year() == time.Now().Year() && date.YearDay() == time.Now().YearDay() {
				streak++
				dayOffset++
				continue
			}
		}
		day := getDateByOffset(dayOffset)

		// check all other days and break when the streak is broken
		if date.Year() == day.Year() && date.YearDay() == day.YearDay() {
			streak++
			dayOffset++
			continue
		} else {
			break
		}

	}
	dayStreak.UserID = userID
	dayStreak.Days = streak
	return dayStreak, nil
}

func getDateByOffset(offset int) time.Time {
	// Get the date by offset from today
	return time.Now().AddDate(0, 0, -offset)
}
