package db

import (
	"time"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

type StreakType int

const (
	CurrentStreak StreakType = iota
	LongestStreak
)

// Updated SportRepository interface to include full CRUD operations using the Sport struct.
type IStreakService interface {
	ParseDates(activityDates []string) (convertedDates []time.Time, err error)
	GetLongestStreak(activityDates []time.Time) (int, error)
	GetCurrentStreak(activityDates []time.Time) (int, error)
	CalculateStreak(activityDates []time.Time, streakType StreakType) (int, error)
	getDateOffset(date time.Time) int
	getDateByOffset(offset int) time.Time
}

type StreakService struct {
	// returns the current time
	// used for DI and tests
	Now func() time.Time
}

func NewStreakService(Now func() time.Time) *StreakService {
	return &StreakService{
		Now: Now,
	}
}

// Parses an array with date strings in type of `YYYY-MM-DD` to an array of time.Time
func (r *StreakService) ParseDates(activityDates []string) (convertedDates []time.Time, err error) {
	convertedDates = make([]time.Time, 0, len(activityDates))
	for _, dateStr := range activityDates {
		// parse `dateStr` from format `YYYY-MM-DD` to time.Time
		recordDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return make([]time.Time, 0), err
		}
		convertedDates = append(convertedDates, recordDate)
	}
	return
}

// GetLongestDayStreak returns the longest streak in days the user ever had
func (r *StreakService) GetLongestStreak(activityDates []time.Time) (int, error) {
	streakDurationDays, err := r.CalculateStreak(activityDates, LongestStreak)
	if err != nil {
		return 0, err
	}
	return streakDurationDays, nil
}

// GetDayStreak retrieves the amount of days a user has been active back to back.
func (r *StreakService) GetCurrentStreak(activityDates []time.Time) (int, error) {
	streakDurationDays, err := r.CalculateStreak(activityDates, CurrentStreak)
	if err != nil {
		return 0, err
	}
	return streakDurationDays, nil
}

// calculates the streak with the given type of the given activity sequence. The sequence needs to
// be in sorted order with the smallest/oldest date last and newest date first.
func (s *StreakService) CalculateStreak(activityDates []time.Time, streakType StreakType) (int, error) {

	// count the days from now
	streak := 0
	longestStreak := 0
	dayOffset := 0
	for i, recordDate := range activityDates {
		if i == 0 {
			// check if date is today, since a streak is considered
			// active, even if the user haven't done sport yet
			if isEqualDate(recordDate, s.Now()) {
				streak++
				dayOffset++
				continue
			}
			dayOffset++
		}
		offsetDate := s.getDateByOffset(dayOffset)

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
				dayOffset = s.getDateOffset(recordDate)
				dayOffset++
			}
		}
	}

	if streak > longestStreak {
		longestStreak = streak
	}

	return longestStreak, nil
}

// Get the date by offset from today
func (s *StreakService) getDateByOffset(offset int) time.Time {
	return s.Now().AddDate(0, 0, -offset)
}

// calculates the offset of the given date from today in days. Some day = offset 0, yesterday = offset 1, ...
// time is truncated to only compare dates, not time of day
func (s *StreakService) getDateOffset(date time.Time) int {
	now := s.Now()

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
