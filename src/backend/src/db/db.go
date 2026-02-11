package db

import (
	"fmt"
	"log"
	"time"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type StreakType int

const (
	CurrentStreak StreakType = iota
	LongestStreak
)

// Updated SportRepository interface to include full CRUD operations using the Sport struct.
type SportRepository interface {
	InsertSport(sport Sport) error
	GetSports(userIDs []Snowflake, limit int, offset int) ([]Sport, error)
	UpdateSport(sport Sport) error
	PatchSport(sport Sport) error
	DeleteSport(id Snowflake, userID Snowflake) error
	GetTotalAmounts(userID Snowflake) ([]SportAmount, error)
	GetDayStreak(userID Snowflake) (DayStreak, error)
}

// Define OrmSportRepository using GORM.
type OrmSportRepository struct {
	DB *gorm.DB
}

// InitORMRepository initializes GORM DB connection and auto-migrates the Sport model.
func InitORMRepository() (*OrmSportRepository, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open("./db/go-to-hell.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}
	// Auto migrate Sport model.
	if err := db.AutoMigrate(&Sport{}); err != nil {
		log.Fatal("failed to migrate:", err)
	}
	fmt.Println("ORM Database initialized and migrated.")
	return &OrmSportRepository{DB: db}, db
}

// InsertSport adds a new Sport entry using ORM.
func (r *OrmSportRepository) InsertSport(sport Sport) error {
	result := r.DB.Create(&sport)
	return result.Error
}

// GetSports retrieves Sport entries for any of the provided userIDs.
// Now checks that user_id is any of the slice values and limits the result to 50.
func (r *OrmSportRepository) GetSports(userIDs []Snowflake, limit int, offset int) ([]Sport, error) {
	var sports []Sport
	result := r.DB.
		Where("user_id IN (?)", userIDs).
		Order("timedate desc").
		Limit(limit).
		Offset(offset).
		Find(&sports)
	return sports, result.Error
}

// Sum all amounts from a given user and group it by sport kind
func (r *OrmSportRepository) GetTotalAmounts(userID Snowflake) ([]SportAmount, error) {
	var results []SportAmount
	result := r.DB.Model(&Sport{}).Select("kind, sum(amount) as amount").Where("user_id = ?", userID).Group("kind").Scan(&results)
	if result.Error != nil {
		return nil, result.Error
	}

	return results, nil
}

// UpdateSport updates a Sport entry using ORM.
func (r *OrmSportRepository) UpdateSport(sport Sport) error {
	result := r.DB.Save(&sport)
	return result.Error
}

// PatchSport updates a Sport entry using ORM. Patch does not CREATE if it does not exist
func (r *OrmSportRepository) PatchSport(sport Sport) error {
	result := r.DB.Model(&sport).Where(&Sport{ID: sport.ID, UserID: sport.UserID}).Updates(sport)
	if result.RowsAffected == 0 {
		return fmt.Errorf("no record found for ID %d and UserID %d", sport.ID, sport.UserID)
	}
	return result.Error
}

// DeleteSport removes a Sport entry by ID using ORM. Record needs to match both `userID` AND `id`
// to be deleted
func (r *OrmSportRepository) DeleteSport(id Snowflake, userID Snowflake) error {
	result := r.DB.Where(&Sport{UserID: userID, ID: id}).Delete(&Sport{})
	return result.Error
}

// GetLongestDayStreak returns the longest streak in days the user ever had
func (r *OrmSportRepository) GetLongestDayStreak(userID Snowflake) (DayStreak, error) {
	return r.getStreakAlgorithm(userID, LongestStreak)
}

// GetDayStreak retrieves the amount of days a user has been active back to back.
func (r *OrmSportRepository) GetDayStreak(userID Snowflake) (DayStreak, error) {
	return r.getStreakAlgorithm(userID, CurrentStreak)
}

func (r *OrmSportRepository) getStreakAlgorithm(userID Snowflake, streakType StreakType) (DayStreak, error) {
	var dayStreak DayStreak
	var activityDates []string

	// SQL query, which filters out the dates (without time, only date)
	// where the user has done sports. These will be loaded into `activityDates`
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
	longestStreak := 0
	dayOffset := 0
	for i, dateStr := range activityDates {
		// parse `dateStr` from format `YYYY-MM-DD` to time.Time
		recordDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return dayStreak, err
		}

		if i == 0 {
			// check if date is today, since a streak is considered
			// active, even if the user haven't done sport yet
			if isEqualDate(recordDate, time.Now()) {
				streak++
				dayOffset++
				continue
			}
			dayOffset++
		}
		offsetDate := getDateByOffset(dayOffset)

		// check all other days and break when the streak is broken
		if isEqualDate(recordDate, offsetDate) {
			streak++
			dayOffset++
			continue
		} else {
			// recordDate is out of sync with offsetDate
			// -> break of streak
			if streakType == CurrentStreak {
				longestStreak = streak
				break
			} else {
				// update longest streak
				if streak > longestStreak {
					longestStreak = streak
				}
				// reset streak and adjust offset
				streak = 1
				dayOffset = getDateOffset(recordDate)
				dayOffset++
			}
		}
	}

	dayStreak.UserID = userID
	dayStreak.Days = longestStreak
	return dayStreak, nil
}

// Get the date by offset from today
func getDateByOffset(offset int) time.Time {
	return time.Now().AddDate(0, 0, -offset)
}

func getDateOffset(date time.Time) int {
	now := time.Now()

	// tuncate to midnight to only compare dates
	now = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	// calculate difference in days
	duration := now.Sub(date)
	days := int(duration.Hours() / 24)

	return days
}

// Whether or not the Year and YearDay of `a` and `b` are similar
func isEqualDate(a time.Time, b time.Time) bool {
	return a.Year() == b.Year() && a.YearDay() == b.YearDay()
}
