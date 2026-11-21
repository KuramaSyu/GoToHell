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
	if err := r.DB.AutoMigrate(&models.Equipment{}, &models.SportXEquipment{}); err != nil {
		return err
	}
	return r.deduplicateSportLinks()
}

// deduplicateSportLinks makes sure a sport entry can only contribute to one
// piece of equipment. Older versions could leave multiple links for the same
// sport entry behind. The newest link is kept; the preferred equipment flag is
// intentionally not considered here because it is only a frontend default.
func (r *GormEquipmentRepository) deduplicateSportLinks() error {
	var links []models.SportXEquipment
	if err := r.DB.Order("equipment_id desc").Find(&links).Error; err != nil {
		return err
	}

	seen := make(map[models.Snowflake]struct{}, len(links))
	for _, link := range links {
		if _, exists := seen[link.SportID]; exists {
			if err := r.DB.Where(
				"equipment_id = ? AND sport_id = ?",
				link.EquipmentID,
				link.SportID,
			).Delete(&models.SportXEquipment{}).Error; err != nil {
				return err
			}
			continue
		}
		seen[link.SportID] = struct{}{}
	}
	return nil
}

// Create inserts a new piece of equipment for a user. If the equipment is
// marked as preferred for a sport, all other equipment of that user loses the
// preference for the same sport.
func (r *GormEquipmentRepository) Create(equipment *models.Equipment) (*models.Equipment, error) {
	equipment.ID = 0 // let GORM create a new record
	err := r.DB.Transaction(func(tx *gorm.DB) error {
		if equipment.PreferredForSport != nil && *equipment.PreferredForSport != "" {
			if err := tx.Model(&models.Equipment{}).
				Where("user_id = ? AND preferred_for_sport = ?", equipment.UserID, *equipment.PreferredForSport).
				Update("preferred_for_sport", nil).Error; err != nil {
				return err
			}
		}
		return tx.Create(equipment).Error
	})
	if err != nil {
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
	if equipment.ClearExpectedUsage {
		updates["expected_usage"] = nil
	} else if equipment.ExpectedUsage != nil {
		updates["expected_usage"] = *equipment.ExpectedUsage
	}
	if equipment.PreferredForSport != nil {
		if *equipment.PreferredForSport == "" {
			updates["preferred_for_sport"] = nil
		} else {
			updates["preferred_for_sport"] = *equipment.PreferredForSport
		}
	}

	if len(updates) == 0 {
		return nil
	}

	return r.DB.Transaction(func(tx *gorm.DB) error {
		if equipment.PreferredForSport != nil && *equipment.PreferredForSport != "" {
			if err := tx.Model(&models.Equipment{}).
				Where("user_id = ? AND preferred_for_sport = ? AND id <> ?", equipment.UserID, *equipment.PreferredForSport, equipment.ID).
				Update("preferred_for_sport", nil).Error; err != nil {
				return err
			}
		}

		result := tx.Model(&models.Equipment{}).
			Where("id = ? AND user_id = ?", equipment.ID, equipment.UserID).
			Updates(updates)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("no equipment found for ID %d and UserID %d", equipment.ID, equipment.UserID)
		}
		return nil
	})
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
// All sports have to belong to the same user. An existing link of a sport to
// another piece of equipment is replaced, so selecting a different shoe
// overwrites the previous selection.
func (r *GormEquipmentRepository) LinkSports(
	equipmentID models.Snowflake,
	userID models.Snowflake,
	sportIDs []models.Snowflake,
) error {
	if len(sportIDs) == 0 {
		return fmt.Errorf("no sport IDs provided")
	}

	return r.DB.Transaction(func(tx *gorm.DB) error {
		var equipment models.Equipment
		if err := tx.Where("id = ? AND user_id = ?", equipmentID, userID).First(&equipment).Error; err != nil {
			return fmt.Errorf("equipment %d not found for user %d: %w", equipmentID, userID, err)
		}

		var sports []models.Sport
		if err := tx.Where("user_id = ? AND id IN ?", userID, sportIDs).Find(&sports).Error; err != nil {
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

		// A sport entry can only use one piece of equipment at a time.
		// Replace existing links before creating the new one.
		if err := tx.Where("sport_id IN ?", sportIDs).Delete(&models.SportXEquipment{}).Error; err != nil {
			return err
		}

		links := make([]models.SportXEquipment, 0, len(sportIDs))
		for _, sportID := range sportIDs {
			links = append(links, models.SportXEquipment{EquipmentID: equipmentID, SportID: sportID})
		}
		return tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&links).Error
	})
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
