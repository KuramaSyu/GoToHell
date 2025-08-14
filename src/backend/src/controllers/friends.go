package controllers

import (
	"net/http"

	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// represents a gin response with has a string message field
// swagger:model MessageResponse
type MessageResponse struct {
	// the response message
	Message string `json:"message"`
}

// FriendsController manages friendship endpoints.
type FriendsController struct {
	repo     db.FriendshipRepository
	userRepo db.UserRepository
}

// Reply for GET /api/friends
//
//swagger:model GetFriendshipReply
type GetFriendshipReply struct {
	Data FriendshipReply `json:"data"`
}

// NewFriendsController initializes a new FriendsController.
func NewFriendsController(database *gorm.DB) *FriendsController {
	repo := db.NewGormFriendshipRepository(database)
	userRepo := db.NewGormUserRepository(database)
	return &FriendsController{repo: repo, userRepo: userRepo}
}

// FriendRequest is the expected payload when creating a friendship.
// swagger:model FriendRequest
type FriendRequest struct {
	FriendID Snowflake        `json:"friend_id" binding:"required"`
	Status   FriendshipStatus `json:"status"`
}

// UpdateFriendshipRequest is the payload for updating a friendship.
type UpdateFriendshipRequest struct {
	FriendshipID Snowflake        `json:"friendship_id" binding:"required"`
	Status       FriendshipStatus `json:"status" binding:"required"`
}

type FriendshipReply struct {
	Friendships []Friendships `json:"friendships"`
	Users       []User        `json:"users"`
}

// GetFriends
// PostSport godoc
// @Summary returns all friendships for the logged-in user along with friend details.
// @Tags 	friends
// @Accept	json
// @Producte json
// @Security CookieAuth
// @Success 200 {object} GetFriendshipReply
// @Failure 400 {object} ErrorReply
// @Failure 502 {object} ErrorReply
// @Router /api/friends [get]
func (fc *FriendsController) GetFriends(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}

	friendships, err := fc.repo.GetFriendships(user.ID)
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}

	var reply FriendshipReply
	reply.Friendships = friendships
	reply.Users = make([]User, 0)
	for _, friendship := range friendships {
		var friendID Snowflake
		// If the logged-in user is the requester, then the other user is the friend.
		if friendship.RequesterID == user.ID {
			friendID = friendship.RecipientID
		} else {
			friendID = friendship.RequesterID
		}

		friendData, err := fc.userRepo.GetUserByID(friendID)
		if err != nil {
			// Skip friendship if unable to fetch friend details.
			continue
		}

		reply.Users = append(reply.Users, *friendData)
	}

	c.JSON(http.StatusOK, GetFriendshipReply{Data: reply})
}

// Format:
// @Param  <name>  body  <Type>  <required?>  "<description>"

// PostFriendship handles POST /friends
// @Summary Creates a request for a friend request
// @Accept json
// @Produce json
// @Param payload body FriendRequest true "Friend request payload"
// @Success 200 {object} MessageResponse
// @Router /friends [post]
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
		req.Status = Pending
	}

	// Decline Accepted as status
	if req.Status == Accepted {
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
	friendshipID, err := NewSnowflakeFromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friendship ID"})
		return
	}

	if err := fc.repo.DeleteFriendship(Snowflake(friendshipID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friendship deleted successfully"})
}
