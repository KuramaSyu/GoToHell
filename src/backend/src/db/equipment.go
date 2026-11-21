package db

import (
	"fmt"

	"github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// NewEquipmentRepository creates the GORM based equipment repository and
// migrates the required tables.
func NewEquipmentRepository(database *gorm.DB) repositories.EquipmentRepository {
	repo := &GormEquipmentRepository{DB: database}
	repo.InitRepo()
	return repo
}

// GormEquipmentRepository is the GORM implementation of EquipmentRepository.
type GormEquipmentRepository struct {
	DB *gorm.DB
}

// InitRepo auto-migrates the equipment table and the equipment/sport link table.
func (r *GormEquipmentRepository) InitRepo() error {
	return r.DB.AutoMigrate(&models.Equipment{}, &models.SportXEquipment{})
}

// Create inserts a new piece of equipment for a user.
func (r *GormEquipmentRepository) Create(equipment *models.Equipment) (*models.Equipment, error) {
	equipment.ID = 0 // let GORM create a new record
	if err := r.DB.Create(equipment).Error; err != nil {
		return nil, err
	}
	return equipment, nil
}

// Update applies the non-nil fields of the given equipment. The user id is
// used to make sure a user can only update their own equipment.
func (r *GormEquipmentRepository) Update(equipment *models.EquipmentUpdate) error {
	updates := map[string]interface{}{}
	if equipment.Name != nil {
		updates["name"] = *equipment.Name
	}
	if equipment.Description != nil {
		updates["description"] = *equipment.Description
	}
	if equipment.StartUsageMeters != nil {
		updates["start_usage_meters"] = *equipment.StartUsageMeters
	}
	if equipment.ExpectedUsage != nil {
		updates["expected_usage"] = *equipment.ExpectedUsage
	}

	if len(updates) == 0 {
		return nil
	}

	result := r.DB.Model(&models.Equipment{}).
		Where("id = ? AND user_id = ?", equipment.ID, equipment.UserID).
		Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("no equipment found for ID %d and UserID %d", equipment.ID, equipment.UserID)
	}
	return nil
}

// DeleteByID deletes equipment owned by userID together with all of its links.
func (r *GormEquipmentRepository) DeleteByID(equipmentID models.Snowflake, userID models.Snowflake) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		result := tx.Where("id = ? AND user_id = ?", equipmentID, userID).
			Delete(&models.Equipment{})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("no equipment found for ID %d and UserID %d", equipmentID, userID)
		}
		return tx.Where("equipment_id = ?", equipmentID).Delete(&models.SportXEquipment{}).Error
	})
}

// FetchByUserID returns all equipment of a user with their current usage.
// Current usage = start usage + sum of the amounts of all linked sport
// entries that still exist. Because the calculation joins the sports table,
// deleted sport entries are automatically ignored.
func (r *GormEquipmentRepository) FetchByUserID(userID models.Snowflake) ([]models.EquipmentWithUsage, error) {
	var equipments []models.Equipment
	if err := r.DB.Where("user_id = ?", userID).Order("id asc").Find(&equipments).Error; err != nil {
		return nil, err
	}

	result := make([]models.EquipmentWithUsage, 0, len(equipments))
	if len(equipments) == 0 {
		return result, nil
	}

	ids := make([]models.Snowflake, 0, len(equipments))
	indexByID := make(map[models.Snowflake]int, len(equipments))
	for i := range equipments {
		ids = append(ids, equipments[i].ID)
		indexByID[equipments[i].ID] = len(result)
		result = append(result, models.EquipmentWithUsage{
			Equipment:          equipments[i],
			CurrentUsageMeters: equipments[i].StartUsageMeters,
			LinkedSports:       []models.Sport{},
		})
	}

	// Usage per equipment. INNER JOIN excludes links to deleted sports.
	type usageRow struct {
		EquipmentID models.Snowflake
		Usage       int
	}
	var usages []usageRow
	err := r.DB.Table("sport_x_equipment").
		Select("sport_x_equipment.equipment_id AS equipment_id, COALESCE(SUM(sports.amount), 0) AS usage").
		Joins("JOIN sports ON sports.id = sport_x_equipment.sport_id").
		Where("sports.user_id = ?", userID).
		Where("sport_x_equipment.equipment_id IN ?", ids).
		Group("sport_x_equipment.equipment_id").
		Scan(&usages).Error
	if err != nil {
		return nil, err
	}
	for _, usage := range usages {
		if index, ok := indexByID[usage.EquipmentID]; ok {
			result[index].CurrentUsageMeters += usage.Usage
		}
	}

	// Linked sports per equipment.
	var links []models.SportXEquipment
	if err := r.DB.Where("equipment_id IN ?", ids).Find(&links).Error; err != nil {
		return nil, err
	}
	if len(links) > 0 {
		sportIDs := make([]models.Snowflake, 0, len(links))
		for _, link := range links {
			sportIDs = append(sportIDs, link.SportID)
		}

		var sports []models.Sport
		if err := r.DB.Where("user_id = ? AND id IN ?", userID, sportIDs).
			Find(&sports).Error; err != nil {
			return nil, err
		}
		sportByID := make(map[models.Snowflake]models.Sport, len(sports))
		for _, sport := range sports {
			sportByID[sport.ID] = sport
		}
		for _, link := range links {
			sport, ok := sportByID[link.SportID]
			if !ok {
				// the sport was deleted, so its link must not count
				continue
			}
			if index, ok := indexByID[link.EquipmentID]; ok {
				result[index].LinkedSports = append(result[index].LinkedSports, sport)
			}
		}
	}

	return result, nil
}

// LinkSports links the given sport entries to equipment owned by userID.
// All sports have to belong to the same user. Linking an already linked sport
// is a no-op.
func (r *GormEquipmentRepository) LinkSports(
	equipmentID models.Snowflake,
	userID models.Snowflake,
	sportIDs []models.Snowflake,
) error {
	var equipment models.Equipment
	if err := r.DB.Where("id = ? AND user_id = ?", equipmentID, userID).First(&equipment).Error; err != nil {
		return fmt.Errorf("equipment %d not found for user %d: %w", equipmentID, userID, err)
	}
	if len(sportIDs) == 0 {
		return fmt.Errorf("no sport IDs provided")
	}

	var sports []models.Sport
	if err := r.DB.Where("user_id = ? AND id IN ?", userID, sportIDs).Find(&sports).Error; err != nil {
		return err
	}
	found := make(map[models.Snowflake]struct{}, len(sports))
	for _, sport := range sports {
		found[sport.ID] = struct{}{}
	}
	for _, sportID := range sportIDs {
		if _, ok := found[sportID]; !ok {
			return fmt.Errorf("sport %d not found for user %d", sportID, userID)
		}
	}

	links := make([]models.SportXEquipment, 0, len(sportIDs))
	for _, sportID := range sportIDs {
		links = append(links, models.SportXEquipment{EquipmentID: equipmentID, SportID: sportID})
	}
	return r.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&links).Error
}

// UnlinkSport removes the link between equipment and a sport entry.
func (r *GormEquipmentRepository) UnlinkSport(
	equipmentID models.Snowflake,
	userID models.Snowflake,
	sportID models.Snowflake,
) error {
	var equipment models.Equipment
	if err := r.DB.Where("id = ? AND user_id = ?", equipmentID, userID).First(&equipment).Error; err != nil {
		return fmt.Errorf("equipment %d not found for user %d: %w", equipmentID, userID, err)
	}
	result := r.DB.Where("equipment_id = ? AND sport_id = ?", equipmentID, sportID).
		Delete(&models.SportXEquipment{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("sport %d is not linked to equipment %d", sportID, equipmentID)
	}
	return nil
}
