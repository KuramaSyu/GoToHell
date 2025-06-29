package repositories

import . "github.com/KuramaSyu/GoToHell/src/backend/src/models"

// Repository with basic operations for OverdueDeaths table
type OverdueDeathRepository interface {
	SetCount(userID Snowflake, game string, count int64)
	FetchAll(useID Snowflake)
}
