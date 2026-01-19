package repositories

import . "github.com/KuramaSyu/GoToHell/src/backend/src/models"

// Repository with basic operations for PersonalGoals table
type PersonalGoalsRepository interface {
	InitRepo() error
	Insert(goal *PersonalGoal) (*PersonalGoal, error)
	Update(goal *PersonalGoal) (*PersonalGoal, error)
	FetchByUserID(userID Snowflake) ([]PersonalGoal, error)
	DeleteByID(goalID Snowflake) error
}
