package models

// a deeper view of a user
type GetUserDetailsReply struct {
	ID             Snowflake      `json:"id"`
	Username       string         `json:"username"`
	Discriminator  string         `json:"discriminator"`
	Avatar         string         `json:"avatar"`
	Goals          []PersonalGoal `json:"goals"`
	CurrentStreak  DayStreak      `json:"current_streak"`
	LongestStreak  DayStreak      `json:"longest_streak"`
	LastActivities []Sport        `json:"last_activities"`
}
