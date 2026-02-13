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
