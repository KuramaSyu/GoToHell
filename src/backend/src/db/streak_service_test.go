package db

import (
	"testing"
	"time"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
)

// Mock OrmSportRepository for testing
type mockSportRepo struct {
	activityDates []string
	err           error
}

func (m *mockSportRepo) GetActicityDates(userID Snowflake) ([]string, error) {
	return m.activityDates, m.err
}

func (m *mockSportRepo) getActicityDates(userID Snowflake) ([]string, error) {
	return m.activityDates, m.err
}

func (m *mockSportRepo) getStreakAlgorithm(activityDates []string, streakType StreakType) (int, error) {
	repo := &OrmSportRepository{}
	return repo.getStreakAlgorithm(activityDates, streakType)
}

func TestGetCurrentStreak(t *testing.T) {
	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	twoDaysAgo := time.Now().AddDate(0, 0, -2).Format("2006-01-02")

	tests := []struct {
		name          string
		activityDates []string
		expectedDays  int
	}{
		{
			name:          "No activity",
			activityDates: []string{},
			expectedDays:  0,
		},
		{
			name:          "Single day today",
			activityDates: []string{today},
			expectedDays:  1,
		},
		{
			name:          "Three consecutive days",
			activityDates: []string{today, yesterday, twoDaysAgo},
			expectedDays:  3,
		},
		{
			name:          "Broken streak",
			activityDates: []string{yesterday, twoDaysAgo, time.Now().AddDate(0, 0, -5).Format("2006-01-02")},
			expectedDays:  2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockSportRepo{activityDates: tt.activityDates}
			service := &StreakService{SportRepo: (*OrmSportRepository)(mockRepo)}

			result, err := service.GetCurrentStreak(Snowflake(123))
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.Days != tt.expectedDays {
				t.Errorf("expected %d days, got %d", tt.expectedDays, result.Days)
			}
		})
	}
}

func TestGetLongestStreak(t *testing.T) {
	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	twoDaysAgo := time.Now().AddDate(0, 0, -2).Format("2006-01-02")
	weekAgo := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	eightDaysAgo := time.Now().AddDate(0, 0, -8).Format("2006-01-02")

	tests := []struct {
		name          string
		activityDates []string
		expectedDays  int
	}{
		{
			name:          "No activity",
			activityDates: []string{},
			expectedDays:  0,
		},
		{
			name:          "Single streak",
			activityDates: []string{today, yesterday, twoDaysAgo},
			expectedDays:  3,
		},
		{
			name:          "Multiple streaks - longest is current",
			activityDates: []string{today, yesterday, twoDaysAgo, time.Now().AddDate(0, 0, -5).Format("2006-01-02")},
			expectedDays:  3,
		},
		{
			name:          "Multiple streaks - longest is past",
			activityDates: []string{yesterday, time.Now().AddDate(0, 0, -5).Format("2006-01-02"), time.Now().AddDate(0, 0, -6).Format("2006-01-02"), time.Now().AddDate(0, 0, -7).Format("2006-01-02")},
			expectedDays:  3,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockSportRepo{activityDates: tt.activityDates}
			service := &StreakService{SportRepo: (*OrmSportRepository)(mockRepo)}

			result, err := service.GetLongestStreak(Snowflake(123))
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.Days != tt.expectedDays {
				t.Errorf("expected %d days, got %d", tt.expectedDays, result.Days)
			}
		})
	}
}

func TestIsEqualDate(t *testing.T) {
	date1 := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)
	date2 := time.Date(2024, 1, 15, 20, 45, 0, 0, time.UTC)
	date3 := time.Date(2024, 1, 16, 10, 30, 0, 0, time.UTC)

	if !isEqualDate(date1, date2) {
		t.Error("expected dates with same day to be equal")
	}
	if isEqualDate(date1, date3) {
		t.Error("expected dates with different days to not be equal")
	}
}

func TestGetDateOffset(t *testing.T) {
	today := time.Now()
	yesterday := today.AddDate(0, 0, -1)
	twoDaysAgo := today.AddDate(0, 0, -2)

	if offset := getDateOffset(today); offset != 0 {
		t.Errorf("expected offset 0 for today, got %d", offset)
	}
	if offset := getDateOffset(yesterday); offset != 1 {
		t.Errorf("expected offset 1 for yesterday, got %d", offset)
	}
	if offset := getDateOffset(twoDaysAgo); offset != 2 {
		t.Errorf("expected offset 2 for two days ago, got %d", offset)
	}
}
