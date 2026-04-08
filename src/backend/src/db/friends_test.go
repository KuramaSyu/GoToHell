package db

import (
	"testing"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// newTestFriendshipRepo builds an isolated in-memory repository for each test.
func newTestFriendshipRepo(t *testing.T) *GormFriendshipRepository {
	t.Helper()

	database, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}

	repo := &GormFriendshipRepository{DB: database}
	if err := repo.InitRepo(); err != nil {
		t.Fatalf("failed to migrate friendships table: %v", err)
	}

	return repo
}

// TestHavePositiveFriendshipStatus verifies the accepted-friendship lookup behavior.
func TestHavePositiveFriendshipStatus(t *testing.T) {
	repo := newTestFriendshipRepo(t)

	userA := Snowflake(100)
	userB := Snowflake(200)

	t.Run("same user is always positive", func(t *testing.T) {
		hasFriendship, err := repo.HavePositiveFriendshipStatus(userA, userA)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !hasFriendship {
			t.Fatalf("expected true for same user")
		}
	})

	t.Run("no existing friendship returns false", func(t *testing.T) {
		hasFriendship, err := repo.HavePositiveFriendshipStatus(userA, userB)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if hasFriendship {
			t.Fatalf("expected false when no accepted friendship exists")
		}
	})

	t.Run("accepted friendship returns true", func(t *testing.T) {
		if err := repo.CreateFriendship(userA, userB, Accepted); err != nil {
			t.Fatalf("failed to create accepted friendship: %v", err)
		}

		// The method must treat friendships as bidirectional when status is accepted.
		hasFriendship, err := repo.HavePositiveFriendshipStatus(userA, userB)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !hasFriendship {
			t.Fatalf("expected true for accepted friendship")
		}
	})
}

// TestCreateFriendshipReversePendingAutoAccept ensures reverse pending requests collapse into one accepted row.
func TestCreateFriendshipReversePendingAutoAccept(t *testing.T) {
	repo := newTestFriendshipRepo(t)

	requester := Snowflake(10)
	recipient := Snowflake(20)

	if err := repo.CreateFriendship(requester, recipient, Pending); err != nil {
		t.Fatalf("failed to create initial pending friendship: %v", err)
	}

	if err := repo.CreateFriendship(recipient, requester, Pending); err != nil {
		t.Fatalf("failed to create reverse friendship: %v", err)
	}

	var friendships []Friendships
	if err := repo.DB.Find(&friendships).Error; err != nil {
		t.Fatalf("failed to load friendships: %v", err)
	}

	if len(friendships) != 1 {
		t.Fatalf("expected exactly one friendship row, got %d", len(friendships))
	}

	// Existing inverse pending request should have been upgraded instead of duplicated.
	if friendships[0].Status != Accepted {
		t.Fatalf("expected friendship status to be accepted, got %s", friendships[0].Status)
	}
}

// TestUpdateFriendshipAcceptAuthorization verifies only the recipient can accept a request.
func TestUpdateFriendshipAcceptAuthorization(t *testing.T) {
	repo := newTestFriendshipRepo(t)

	requester := Snowflake(1)
	recipient := Snowflake(2)
	outsider := Snowflake(3)

	if err := repo.CreateFriendship(requester, recipient, Pending); err != nil {
		t.Fatalf("failed to create pending friendship: %v", err)
	}

	var created Friendships
	if err := repo.DB.Where("requester_id = ? AND recipient_id = ?", requester, recipient).First(&created).Error; err != nil {
		t.Fatalf("failed to fetch created friendship: %v", err)
	}

	// A third-party user cannot accept another user's incoming friend request.
	if err := repo.UpdateFriendship(created.ID, outsider, Accepted); err == nil {
		t.Fatalf("expected unauthorized user to fail accepting request")
	}

	if err := repo.UpdateFriendship(created.ID, recipient, Accepted); err != nil {
		t.Fatalf("expected recipient to accept request, got error: %v", err)
	}

	var updated Friendships
	if err := repo.DB.First(&updated, created.ID).Error; err != nil {
		t.Fatalf("failed to fetch updated friendship: %v", err)
	}

	if updated.Status != Accepted {
		t.Fatalf("expected accepted status after update, got %s", updated.Status)
	}
}

// TestGetAndDeleteFriendships checks filtering by user and deletion behavior.
func TestGetAndDeleteFriendships(t *testing.T) {
	repo := newTestFriendshipRepo(t)

	userA := Snowflake(1001)
	userB := Snowflake(1002)
	userC := Snowflake(1003)

	if err := repo.CreateFriendship(userA, userB, Pending); err != nil {
		t.Fatalf("failed to create friendship userA-userB: %v", err)
	}
	if err := repo.CreateFriendship(userC, userA, Accepted); err != nil {
		t.Fatalf("failed to create friendship userC-userA: %v", err)
	}

	friendships, err := repo.GetFriendships(userA)
	if err != nil {
		t.Fatalf("GetFriendships failed: %v", err)
	}

	if len(friendships) != 2 {
		t.Fatalf("expected 2 friendships for userA, got %d", len(friendships))
	}

	// Delete one returned record and ensure user-scoped listing reflects the change.
	if err := repo.DeleteFriendship(friendships[0].ID); err != nil {
		t.Fatalf("DeleteFriendship failed: %v", err)
	}

	remaining, err := repo.GetFriendships(userA)
	if err != nil {
		t.Fatalf("GetFriendships after delete failed: %v", err)
	}

	if len(remaining) != 1 {
		t.Fatalf("expected 1 friendship after delete, got %d", len(remaining))
	}
}
