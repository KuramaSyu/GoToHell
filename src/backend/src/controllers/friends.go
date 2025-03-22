package controllers

import (
	"net/http"
	"strconv"

	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// FriendsController manages friendship endpoints.
type FriendsController struct {
	repo db.FriendshipRepository
}

// NewFriendsController initializes a new FriendsController.
func NewFriendsController(database *gorm.DB) *FriendsController {
	repo := db.NewGormFriendshipRepository(database)
	return &FriendsController{repo: repo}
}

// FriendRequest is the expected payload when creating a friendship.
type FriendRequest struct {
	FriendID uint                `json:"friend_id" binding:"required"`
	Status   db.FriendshipStatus `json:"status"` // Optional: will default to "pending" if empty.
}

// UpdateFriendshipRequest is the payload for updating a friendship.
type UpdateFriendshipRequest struct {
	FriendshipID uint                `json:"friendship_id" binding:"required"`
	Status       db.FriendshipStatus `json:"status" binding:"required"`
}

// GetFriends returns all friendships for the logged-in user.
func (fc *FriendsController) GetFriends(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	friendships, err := fc.repo.GetFriendships(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": friendships})
}

// PostFriendship creates a new friendship.
func (fc *FriendsController) PostFriendship(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	var req FriendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default status is pending if not provided.
	if req.Status == "" {
		req.Status = db.Pending
	}

	// Decline Accepted as status
	if req.Status == db.Accepted {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can't establish a friendship by just saying, you accept it"})
		return
	}

	// The logged-in user's id is used as UserId1.
	// the recipient is always the second param
	if err := fc.repo.CreateFriendship(user.ID, req.FriendID, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friendship created successfully"})
}

// UpdateFriendship updates an existing friendship's status.
func (fc *FriendsController) UpdateFriendship(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	var req UpdateFriendshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := fc.repo.UpdateFriendship(req.FriendshipID, user.ID, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friendship updated successfully"})
}

// DeleteFriendship removes a friendship record.
func (fc *FriendsController) DeleteFriendship(c *gin.Context) {
	_, status, err := UserFromSession(c)
	if err != nil {
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	idStr := c.Param("id")
	friendshipID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friendship ID"})
		return
	}

	if err := fc.repo.DeleteFriendship(uint(friendshipID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friendship deleted successfully"})
}
