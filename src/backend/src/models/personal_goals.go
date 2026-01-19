package models

type TimeFrequency string

const (
	Daily   TimeFrequency = "daily"
	Weekly  TimeFrequency = "weekly"
	Monthly TimeFrequency = "monthly"
)

// SQL Table representing a friendship between person A <RequesterID> and person B <RecipientID>.
// The status <Status> of the friendship is either pending, accepted or blocked
type PersonalGoal struct {
	ID        Snowflake     `gorm:"primaryKey" json:"id"`
	UserID    Snowflake     `gorm:"not null;index" json:"user_id"`
	Amount    int           `json:"amount"`
	Frequency TimeFrequency `json:"frequency"`
	Sport     string        `json:"sport"`

	// just a constraint to use UserID as foreign key
	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
}
