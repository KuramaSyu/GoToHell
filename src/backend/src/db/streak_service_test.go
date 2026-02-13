package db

import (
	"reflect"
	"testing"
	"time"
)

func TestTableCurrentStreak(t *testing.T) {
	// Defining the columns of the table
	var tests = []struct {
		name  string
		input []string
		want  int
	}{
		// the table itself
		{"No activities should be 0", make([]string, 0), 0},
		{"One activity should be 1", []string{"2023-01-06"}, 1},
		{"Two activities on the same day should be 1", []string{"2023-01-06", "2023-01-06"}, 1},
		{"Two activities on consecutive days should be 2", []string{"2023-01-06", "2023-01-05"}, 2},
		{"A broken streak of 3 and a current streak of 2 should be 2", []string{"2023-01-06", "2023-01-05", "2023-01-03", "2023-01-02", "2023-01-01"}, 2},
		{"A streak of 3 from yesterday should count as 3", []string{"2023-01-05", "2023-01-04", "2023-01-03", "2023-01-01"}, 3},
		{"A streak of 3 from two days ago should count as 0", []string{"2023-01-04", "2023-01-03", "2023-01-02"}, 0},
	}

	// define service with current date time of 2023-01-06, 23:00:00, so that the test results are deterministic
	var streakService IStreakService = NewStreakService(func() time.Time {
		return time.Date(2023, 1, 6, 23, 0, 0, 0, time.UTC)
	})
	// The execution loop
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dates, _ := streakService.ParseDates(tt.input)
			t.Logf("Parsed dates: %v", dates)
			ans, err := streakService.GetCurrentStreak(dates)
			if err != nil {
				t.Errorf("%s failed with error: %s", tt.name, err.Error())
			} else if ans != tt.want {
				t.Errorf("got %v, want %v", ans, tt.want)
			}
		})
	}
}

func TestTableLongestStreak(t *testing.T) {
	// Defining the columns of the table
	var tests = []struct {
		name  string
		input []string
		want  int
	}{
		// the table itself
		{"No activities should be 0", make([]string, 0), 0},
		{"One activity should be 1", []string{"2023-01-06"}, 1},
		{"Two activities on the same day should be 1", []string{"2023-01-06", "2023-01-06"}, 1},
		{"Two activities on consecutive days should be 2", []string{"2023-01-06", "2023-01-05"}, 2},
		{"A broken streak of 3 and a current streak of 2 should be 3", []string{"2023-01-06", "2023-01-05", "2023-01-03", "2023-01-02", "2023-01-01"}, 3},
		{"A streak of 3 from yesterday should count as 3", []string{"2023-01-05", "2023-01-04", "2023-01-03", "2023-01-01"}, 3},
		{"A streak of 3 from two days ago should count as 3", []string{"2023-01-04", "2023-01-03", "2023-01-02"}, 3},
		{"Longest streak of 4 in the past, current streak 1", []string{"2023-01-06", "2023-01-01", "2022-12-31", "2022-12-30", "2022-12-29"}, 4},
		{"Multiple streaks of same length", []string{"2023-01-06", "2023-01-05", "2023-01-03", "2023-01-02"}, 2},
	}

	// define service with current date time of 2023-01-10, 23:00:00, so that the test results are deterministic
	// date is in the future to ensure that current streak always is 0
	var streakService IStreakService = NewStreakService(func() time.Time {
		return time.Date(2023, 1, 10, 23, 0, 0, 0, time.UTC)
	})
	// The execution loop
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dates, _ := streakService.ParseDates(tt.input)
			t.Logf("Parsed dates: %v", dates)
			ans, err := streakService.GetLongestStreak(dates)
			if err != nil {
				t.Errorf("%s failed with error: %s", tt.name, err.Error())
			} else if ans != tt.want {
				t.Errorf("got %v, want %v", ans, tt.want)
			}
		})
	}
}

func TestGetDateByOffset(t *testing.T) {
	// Mock Now to Jan 6th 2023, 12:00
	fixedTime := time.Date(2023, 1, 6, 12, 0, 0, 0, time.UTC)
	service := NewStreakService(func() time.Time { return fixedTime })

	tests := []struct {
		name   string
		offset int
		want   time.Time
	}{
		{"Offset 0 (Today)", 0, time.Date(2023, 1, 6, 12, 0, 0, 0, time.UTC)},
		{"Offset 1 (Yesterday)", 1, time.Date(2023, 1, 5, 12, 0, 0, 0, time.UTC)},
		{"Offset 365 (Year ago)", 365, time.Date(2022, 1, 6, 12, 0, 0, 0, time.UTC)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := service.getDateByOffset(tt.offset)
			if !got.Equal(tt.want) {
				t.Errorf("getDateByOffset(%d) = %v; want %v", tt.offset, got, tt.want)
			}
		})
	}
}

func TestGetDateOffset(t *testing.T) {
	// Mock Now to Jan 6th 2023
	fixedTime := time.Date(2023, 1, 6, 23, 59, 59, 0, time.UTC)
	service := NewStreakService(func() time.Time { return fixedTime })

	tests := []struct {
		name  string
		input time.Time
		want  int
	}{
		{"Same day (morning)", time.Date(2023, 1, 6, 0, 0, 0, 0, time.UTC), 0},
		{"Same day (evening)", time.Date(2023, 1, 6, 23, 0, 0, 0, time.UTC), 0},
		{"Yesterday", time.Date(2023, 1, 5, 12, 0, 0, 0, time.UTC), 1},
		{"Tomorrow", time.Date(2023, 1, 7, 12, 0, 0, 0, time.UTC), -1},
		{"Last year", time.Date(2022, 1, 6, 12, 0, 0, 0, time.UTC), 365},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := service.getDateOffset(tt.input)
			if got != tt.want {
				t.Errorf("getDateOffset(%v) = %d; want %d", tt.input, got, tt.want)
			}
		})
	}
}

func TestTableDateParsing(t *testing.T) {
	// Defining the columns of the table
	var tests = []struct {
		name  string
		input []string
		want  []time.Time
	}{
		// the table itself
		{"Correctly parsing an iso date YYYY-MM-DD should return a time", []string{"2001-02-03"}, []time.Time{time.Date(2001, 2, 3, 0, 0, 0, 0, time.UTC)}},
	}

	// define service; time does not matter for this test
	var streakService IStreakService = NewStreakService(time.Now)
	// The execution loop
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ans, err := streakService.ParseDates(tt.input)
			if err != nil {
				t.Errorf("%s failed with error: %s", tt.name, err.Error())
			} else if !reflect.DeepEqual(ans, tt.want) {
				t.Errorf("got %s, want %v", ans, tt.want)
			}
		})
	}
}
