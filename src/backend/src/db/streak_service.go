package db

import (
	"time"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

type StreakType int

const (
	CurrentStreak StreakType = iota
	LongestStreak
)

// Updated SportRepository interface to include full CRUD operations using the Sport struct.
type IStreakService interface {
	GetLongstStreak(userID Snowflake) (DayStreak, error)
	GetCurrentStreak(userID Snowflake) (DayStreak, error)
}

type StreakService struct {
	SportRepo *OrmSportRepository
}

func InitStreakService(sportRepo *OrmSportRepository) StreakService {
	return StreakService{SportRepo: sportRepo}
}

// GetLongestDayStreak returns the longest streak in days the user ever had
func (r *StreakService) GetLongestStreak(userID Snowflake) (DayStreak, error) {
	activityDates, err := r.SportRepo.GetActicityDates(userID)
	if err != nil {
		return DayStreak{}, err
	}
	streakDurationDays, err := r.SportRepo.getStreakAlgorithm(activityDates, LongestStreak)
	if err != nil {
		return DayStreak{}, err
	}
	return DayStreak{UserID: userID, Days: streakDurationDays}, nil
}

// GetDayStreak retrieves the amount of days a user has been active back to back.
func (r *StreakService) GetCurrentStreak(userID Snowflake) (DayStreak, error) {
	activityDates, err := r.SportRepo.getActicityDates(userID)
	if err != nil {
		return DayStreak{}, err
	}
	streakDurationDays, err := r.SportRepo.getStreakAlgorithm(activityDates, CurrentStreak)
	if err != nil {
		return DayStreak{}, err
	}
	return DayStreak{UserID: userID, Days: streakDurationDays}, nil
}

// calculates the streak with the given type of the given activity sequence. The sequence needs to
// be in sorted order
func (r *OrmSportRepository) getStreakAlgorithm(activityDates []string, streakType StreakType) (int, error) {

	// count the days from now
	streak := 0
	longestStreak := 0
	dayOffset := 0
	for i, dateStr := range activityDates {
		// parse `dateStr` from format `YYYY-MM-DD` to time.Time
		recordDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return 0, err
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

	return longestStreak, nil
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
