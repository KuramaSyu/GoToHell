package repositories

import . "github.com/KuramaSyu/GoToHell/src/backend/src/models"

// EquipmentRepository defines the operations for equipment and their links
// to sport entries.
type EquipmentRepository interface {
	InitRepo() error
	Create(equipment *Equipment) (*Equipment, error)
	Update(equipment *EquipmentUpdate) error
	DeleteByID(equipmentID Snowflake, userID Snowflake) error
	FetchByUserID(userID Snowflake) ([]EquipmentWithUsage, error)
	LinkSports(equipmentID Snowflake, userID Snowflake, sportIDs []Snowflake) error
	UnlinkSport(equipmentID Snowflake, userID Snowflake, sportID Snowflake) error
}
