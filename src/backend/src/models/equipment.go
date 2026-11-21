package models

// SQL table representing a piece of equipment (e.g. running shoes) owned by
// a user <UserID>. <StartUsageMeters> is the distance the equipment had
// already been used for before it was added to GoToHell. The current usage is
// calculated by adding the amounts of all linked sport entries.
//
// swagger:model Equipment
type Equipment struct {
	ID               Snowflake `gorm:"primaryKey" json:"id"`
	UserID           Snowflake `gorm:"not null;index" json:"user_id"`
	Name             string    `gorm:"not null" json:"name"`
	Description      string    `json:"description"`
	StartUsageMeters int       `json:"start_usage_meters"`
	// ExpectedUsage is the distance the equipment is expected to last, in
	// meters. It is nullable because not every kind of equipment has a
	// predictable lifespan.
	ExpectedUsage *int `json:"expected_usage"`
}

// SportXEquipment links a sport entry <SportID> from the sports table to a
// piece of equipment <EquipmentID>. The link is the source of truth for which
// sport entries contribute to the equipment's usage.
//
// swagger:model SportXEquipment
type SportXEquipment struct {
	EquipmentID Snowflake `gorm:"primaryKey;autoIncrement:false;index" json:"equipment_id"`
	SportID     Snowflake `gorm:"primaryKey;autoIncrement:false;index" json:"sport_id"`
}

// TableName uses a dedicated join table for the sport <-> equipment relation.
func (SportXEquipment) TableName() string {
	return "sport_x_equipment"
}

// EquipmentWithUsage is a piece of equipment including the usage calculated
// from its start usage plus all currently linked sport entries. Deleted sport
// entries are automatically excluded because only existing sports are joined.
//
// swagger:model EquipmentWithUsage
type EquipmentWithUsage struct {
	Equipment
	CurrentUsageMeters int     `json:"current_usage_meters"`
	LinkedSports       []Sport `json:"linked_sports"`
}

// PostEquipmentRequest is the payload used to create a piece of equipment.
//
// swagger:model PostEquipmentRequest
type PostEquipmentRequest struct {
	Name             string `json:"name" binding:"required" example:"Running Shoes"`
	Description      string `json:"description" example:"My daily trainers"`
	StartUsageMeters int    `json:"start_usage_meters" example:"12000"`
	ExpectedUsage    *int   `json:"expected_usage" example:"800000"`
}

// EquipmentUpdate contains the fields to change for a piece of equipment.
// Omitted fields stay unchanged.
type EquipmentUpdate struct {
	ID               Snowflake
	UserID           Snowflake
	Name             *string
	Description      *string
	StartUsageMeters *int
	ExpectedUsage    *int
}

// PatchEquipmentRequest is the payload used to update a piece of equipment.
// Fields that are omitted stay unchanged.
//
// swagger:model PatchEquipmentRequest
type PatchEquipmentRequest struct {
	ID               Snowflake `json:"id" binding:"required"`
	Name             *string   `json:"name,omitempty" example:"Running Shoes"`
	Description      *string   `json:"description,omitempty" example:"My daily trainers"`
	StartUsageMeters *int      `json:"start_usage_meters,omitempty" example:"12000"`
	ExpectedUsage    *int      `json:"expected_usage,omitempty" example:"800000"`
}

// LinkEquipmentSportsRequest links one or more sport entries to equipment.
//
// swagger:model LinkEquipmentSportsRequest
type LinkEquipmentSportsRequest struct {
	SportIDs []Snowflake `json:"sport_ids" binding:"required"`
}
