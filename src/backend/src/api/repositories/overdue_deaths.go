package repositories

import . "github.com/KuramaSyu/GoToHell/src/backend/src/models"

// Repository with basic operations for OverdueDeaths table
type OverdueDeathRepository interface {
	InitRepo() error
	SetCount(userID Snowflake, game string, count int64) (*OverdueDeaths, error)
	CreateCount(userID Snowflake, game string, count int64) (*OverdueDeaths, error)
	UpdateCount(userID Snowflake, game string, count int64) (*OverdueDeaths, error)
	FetchAll(useID Snowflake) ([]OverdueDeaths, error)
	Delete(userID Snowflake, game string) error
}
