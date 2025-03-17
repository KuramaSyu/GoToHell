package db

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Sport struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Kind     string `json:"kind"`
	Amount   int    `json:"amount"`
	Timedate string `json:"timedate"`
	UserID   string `json:"user_id"`
	Game     string `json:"game"`
}

// Updated Repository interface to include full CRUD operations using the Sport struct.
type Repository interface {
	InsertSport(sport Sport) error
	GetSports(userID string) ([]Sport, error)
	UpdateSport(sport Sport) error
	DeleteSport(id uint) error
	GetTotalAmounts(userID string) ([]models.SportAmount, error)
}

func InitDB() *sql.DB {
	// Open (or create) SQLite database
	db, err := sql.Open("sqlite3", "/root/db/go-to-hell.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create table on startup
	createSportsTable(db)

	fmt.Println("Database initialized and 'sports' table created successfully.")
	return db
}

func createSportsTable(db *sql.DB) {
	query := `
	CREATE TABLE IF NOT EXISTS sports (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		kind TEXT NOT NULL,
		amount INTEGER NOT NULL,
		timedate TEXT NOT NULL,
		user_id BIGINT NOT NULL
	);
	`

	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create 'sports' table:", err)
	}
}

type Database struct {
	db *sql.DB
}

func (d *Database) InsertSport(kind string, amount int, userID string) error {
	query := `
	INSERT INTO sports (kind, amount, timedate, user_id)
	VALUES (?, ?, datetime('now'), ?);
	`

	_, err := d.db.Exec(query, kind, amount, userID)
	return err
}

func (d *Database) GetSports(userID string) ([]Sport, error) {
	query := `
	SELECT kind, amount, timedate
	FROM sports
	WHERE user_id = ?;
	`

	rows, err := d.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sports []Sport
	for rows.Next() {
		var s Sport
		if err := rows.Scan(&s.Kind, &s.Amount, &s.Timedate); err != nil {
			return nil, err
		}
		s.UserID = userID
		sports = append(sports, s)
	}

	return sports, nil
}

// Define ORMRepository using GORM.
type ORMRepository struct {
	DB *gorm.DB
}

// InitORMRepository initializes GORM DB connection and auto-migrates the Sport model.
func InitORMRepository() *ORMRepository {
	db, err := gorm.Open(sqlite.Open("/root/db/go-to-hell.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}
	// Auto migrate Sport model.
	if err := db.AutoMigrate(&Sport{}); err != nil {
		log.Fatal("failed to migrate:", err)
	}
	fmt.Println("ORM Database initialized and migrated.")
	return &ORMRepository{DB: db}
}

// InsertSport adds a new Sport entry using ORM.
func (r *ORMRepository) InsertSport(sport Sport) error {
	result := r.DB.Create(&sport)
	return result.Error
}

// GetSports retrieves Sport entries by userID using ORM.
func (r *ORMRepository) GetSports(userID string) ([]Sport, error) {
	var sports []Sport
	result := r.DB.Where("user_id = ?", userID).Find(&sports)
	return sports, result.Error
}

// Sum all amounts from a given user and group it by sport kind
func (r *ORMRepository) GetTotalAmounts(userID string) ([]models.SportAmount, error) {
	var results []models.SportAmount
	result := r.DB.Model(&Sport{}).Select("kind, sum(amount) as amount").Where("user_id = ?", userID).Group("kind").Scan(&results)
	if result.Error != nil {
		return nil, result.Error
	}

	return results, nil
}

// UpdateSport updates a Sport entry using ORM.
func (r *ORMRepository) UpdateSport(sport Sport) error {
	result := r.DB.Save(&sport)
	return result.Error
}

// DeleteSport removes a Sport entry by ID using ORM.
func (r *ORMRepository) DeleteSport(id uint) error {
	result := r.DB.Delete(&Sport{}, id)
	return result.Error
}
