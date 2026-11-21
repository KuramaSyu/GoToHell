package db

import (
	"testing"
	"time"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func newTestEquipmentRepo(t *testing.T) (*GormEquipmentRepository, *gorm.DB) {
	t.Helper()

	database, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := database.AutoMigrate(&Sport{}); err != nil {
		t.Fatalf("failed to migrate sports table: %v", err)
	}

	repo := &GormEquipmentRepository{DB: database}
	if err := repo.InitRepo(); err != nil {
		t.Fatalf("failed to migrate equipment tables: %v", err)
	}

	return repo, database
}

func TestEquipmentUsageIncludesLinkedSports(t *testing.T) {
	repo, database := newTestEquipmentRepo(t)
	userID := Snowflake(1)

	equipment, err := repo.Create(&Equipment{
		UserID:           userID,
		Name:             "Running Shoes",
		StartUsageMeters: 1000,
	})
	if err != nil {
		t.Fatalf("failed to create equipment: %v", err)
	}

	sportA := Sport{Kind: "jogging", Amount: 8000, UserID: userID, Timedate: time.Now().UTC()}
	sportB := Sport{Kind: "cycling", Amount: 5000, UserID: userID, Timedate: time.Now().UTC()}
	if err := database.Create(&sportA).Error; err != nil {
		t.Fatalf("failed to create sport A: %v", err)
	}
	if err := database.Create(&sportB).Error; err != nil {
		t.Fatalf("failed to create sport B: %v", err)
	}

	if err := repo.LinkSports(equipment.ID, userID, []Snowflake{sportA.ID, sportB.ID}); err != nil {
		t.Fatalf("failed to link sports: %v", err)
	}

	result, err := repo.FetchByUserID(userID)
	if err != nil {
		t.Fatalf("failed to fetch equipment: %v", err)
	}
	if len(result) != 1 {
		t.Fatalf("expected 1 equipment, got %d", len(result))
	}
	if result[0].CurrentUsageMeters != 14000 {
		t.Fatalf("expected usage 14000, got %d", result[0].CurrentUsageMeters)
	}
	if result[0].ExpectedUsage != nil {
		t.Fatalf("expected expected_usage to be null by default, got %d", *result[0].ExpectedUsage)
	}
	if len(result[0].LinkedSports) != 2 {
		t.Fatalf("expected 2 linked sports, got %d", len(result[0].LinkedSports))
	}
}

func TestEquipmentUsageIgnoresDeletedSports(t *testing.T) {
	repo, database := newTestEquipmentRepo(t)
	userID := Snowflake(42)

	equipment, err := repo.Create(&Equipment{
		UserID:           userID,
		Name:             "Trail Shoes",
		StartUsageMeters: 2500,
	})
	if err != nil {
		t.Fatalf("failed to create equipment: %v", err)
	}

	sportA := Sport{Kind: "jogging", Amount: 8000, UserID: userID, Timedate: time.Now().UTC()}
	sportB := Sport{Kind: "jogging", Amount: 3000, UserID: userID, Timedate: time.Now().UTC()}
	if err := database.Create(&sportA).Error; err != nil {
		t.Fatalf("failed to create sport A: %v", err)
	}
	if err := database.Create(&sportB).Error; err != nil {
		t.Fatalf("failed to create sport B: %v", err)
	}

	if err := repo.LinkSports(equipment.ID, userID, []Snowflake{sportA.ID, sportB.ID}); err != nil {
		t.Fatalf("failed to link sports: %v", err)
	}

	// Deleting the sport must remove its contribution on the next calculation.
	if err := database.Delete(&Sport{}, sportA.ID).Error; err != nil {
		t.Fatalf("failed to delete sport: %v", err)
	}

	result, err := repo.FetchByUserID(userID)
	if err != nil {
		t.Fatalf("failed to fetch equipment: %v", err)
	}
	if len(result) != 1 {
		t.Fatalf("expected 1 equipment, got %d", len(result))
	}
	if result[0].CurrentUsageMeters != 5500 {
		t.Fatalf("expected usage 5500 after deleting a linked sport, got %d", result[0].CurrentUsageMeters)
	}
	if len(result[0].LinkedSports) != 1 {
		t.Fatalf("expected 1 remaining linked sport, got %d", len(result[0].LinkedSports))
	}
}

func TestLinkSportsRejectsOtherUsersSports(t *testing.T) {
	repo, database := newTestEquipmentRepo(t)
	ownerID := Snowflake(1)
	otherID := Snowflake(2)

	equipment, err := repo.Create(&Equipment{UserID: ownerID, Name: "Shoes"})
	if err != nil {
		t.Fatalf("failed to create equipment: %v", err)
	}

	otherSport := Sport{Kind: "jogging", Amount: 1000, UserID: otherID, Timedate: time.Now().UTC()}
	if err := database.Create(&otherSport).Error; err != nil {
		t.Fatalf("failed to create sport: %v", err)
	}

	if err := repo.LinkSports(equipment.ID, ownerID, []Snowflake{otherSport.ID}); err == nil {
		t.Fatalf("expected linking another user's sport to fail")
	}
}

func TestPreferredEquipmentIsUniquePerSport(t *testing.T) {
	repo, _ := newTestEquipmentRepo(t)
	userID := Snowflake(7)
	sportA := "jogging"
	sportB := "jogging"

	first, err := repo.Create(&Equipment{
		UserID:            userID,
		Name:              "First Shoes",
		PreferredForSport: &sportA,
	})
	if err != nil {
		t.Fatalf("failed to create first equipment: %v", err)
	}

	second, err := repo.Create(&Equipment{
		UserID:            userID,
		Name:              "Second Shoes",
		PreferredForSport: &sportB,
	})
	if err != nil {
		t.Fatalf("failed to create second equipment: %v", err)
	}

	result, err := repo.FetchByUserID(userID)
	if err != nil {
		t.Fatalf("failed to fetch equipment: %v", err)
	}
	for _, item := range result {
		if item.ID == first.ID && item.PreferredForSport != nil {
			t.Fatalf("expected first equipment preference to be cleared")
		}
		if item.ID == second.ID && (item.PreferredForSport == nil || *item.PreferredForSport != sportB) {
			t.Fatalf("expected second equipment to be preferred for %s", sportB)
		}
	}
}

func TestLinkingSportOverwritesPreviousEquipment(t *testing.T) {
	repo, database := newTestEquipmentRepo(t)
	userID := Snowflake(11)

	first, err := repo.Create(&Equipment{UserID: userID, Name: "First"})
	if err != nil {
		t.Fatalf("failed to create first equipment: %v", err)
	}
	second, err := repo.Create(&Equipment{UserID: userID, Name: "Second"})
	if err != nil {
		t.Fatalf("failed to create second equipment: %v", err)
	}

	sport := Sport{Kind: "jogging", Amount: 5000, UserID: userID, Timedate: time.Now().UTC()}
	if err := database.Create(&sport).Error; err != nil {
		t.Fatalf("failed to create sport: %v", err)
	}

	if err := repo.LinkSports(first.ID, userID, []Snowflake{sport.ID}); err != nil {
		t.Fatalf("failed to link first equipment: %v", err)
	}
	if err := repo.LinkSports(second.ID, userID, []Snowflake{sport.ID}); err != nil {
		t.Fatalf("failed to link second equipment: %v", err)
	}

	result, err := repo.FetchByUserID(userID)
	if err != nil {
		t.Fatalf("failed to fetch equipment: %v", err)
	}
	for _, item := range result {
		if item.ID == first.ID && item.CurrentUsageMeters != 0 {
			t.Fatalf("expected first equipment usage to be reset, got %d", item.CurrentUsageMeters)
		}
		if item.ID == second.ID && item.CurrentUsageMeters != 5000 {
			t.Fatalf("expected second equipment usage 5000, got %d", item.CurrentUsageMeters)
		}
	}
}

func TestInitRepoRemovesDuplicateSportLinks(t *testing.T) {
	repo, database := newTestEquipmentRepo(t)
	userID := Snowflake(12)

	first, err := repo.Create(&Equipment{UserID: userID, Name: "First"})
	if err != nil {
		t.Fatalf("failed to create first equipment: %v", err)
	}
	second, err := repo.Create(&Equipment{UserID: userID, Name: "Second"})
	if err != nil {
		t.Fatalf("failed to create second equipment: %v", err)
	}

	sport := Sport{Kind: "jogging", Amount: 7000, UserID: userID, Timedate: time.Now().UTC()}
	if err := database.Create(&sport).Error; err != nil {
		t.Fatalf("failed to create sport: %v", err)
	}

	if err := database.Create(&SportXEquipment{EquipmentID: first.ID, SportID: sport.ID}).Error; err != nil {
		t.Fatalf("failed to create first link: %v", err)
	}
	if err := database.Create(&SportXEquipment{EquipmentID: second.ID, SportID: sport.ID}).Error; err != nil {
		t.Fatalf("failed to create second link: %v", err)
	}

	if err := repo.InitRepo(); err != nil {
		t.Fatalf("failed to rerun init: %v", err)
	}

	result, err := repo.FetchByUserID(userID)
	if err != nil {
		t.Fatalf("failed to fetch equipment: %v", err)
	}
	for _, item := range result {
		if item.ID == first.ID && item.CurrentUsageMeters != 0 {
			t.Fatalf("expected first equipment usage 0, got %d", item.CurrentUsageMeters)
		}
		if item.ID == second.ID && item.CurrentUsageMeters != 7000 {
			t.Fatalf("expected second equipment usage 7000, got %d", item.CurrentUsageMeters)
		}
	}
}
