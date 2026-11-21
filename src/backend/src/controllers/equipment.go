package controllers

import (
	"fmt"
	"net/http"

	"github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
)

// GetEquipmentReply is the reply sent when requesting a user's equipment.
// swagger:model GetEquipmentReply
type GetEquipmentReply struct {
	Data []models.EquipmentWithUsage `json:"data"`
}

// PostEquipmentReply is the reply sent after creating equipment.
// swagger:model PostEquipmentReply
type PostEquipmentReply struct {
	Data models.Equipment `json:"data"`
}

// NewEquipmentController creates a new equipment controller.
func NewEquipmentController(repo repositories.EquipmentRepository) *EquipmentController {
	return &EquipmentController{repo: repo}
}

// EquipmentController manages equipment endpoints.
type EquipmentController struct {
	repo repositories.EquipmentRepository
}

// userAndPathID extracts the session user and the user id from the path and
// ensures that both are the same. Equipment modifications are only allowed
// for the owner.
func (self *EquipmentController) userAndPathID(c *gin.Context) (*models.User, models.Snowflake, bool) {
	requestedUserID, err := models.NewSnowflakeFromString(c.Param("user_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("invalid user_id: %w", err))
		return nil, 0, false
	}

	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return nil, 0, false
	}
	if user.ID != requestedUserID {
		SetGinError(c, http.StatusForbidden, fmt.Errorf("cannot access another user's equipment"))
		return nil, 0, false
	}
	return user, requestedUserID, true
}

// Get returns the user's equipment including the calculated current usage.
// @Summary Get all equipment of the requested user with calculated usage
// @Tags Equipment
// @Produce json
// @Security CookieAuth
// @Param user_id path string true "User ID"
// @Success 200 {object} GetEquipmentReply
// @Failure 400 {object} ErrorReply
// @Failure 403 {object} ErrorReply
// @Router /api/user/{user_id}/equipment [get]
func (self *EquipmentController) Get(c *gin.Context) {
	_, userID, ok := self.userAndPathID(c)
	if !ok {
		return
	}

	equipment, err := self.repo.FetchByUserID(userID)
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, GetEquipmentReply{Data: equipment})
}

// Post creates a new piece of equipment for the user.
// @Summary Create a piece of equipment (e.g. running shoes)
// @Tags Equipment
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param user_id path string true "User ID"
// @Param equipment body models.PostEquipmentRequest true "Equipment payload"
// @Success 201 {object} PostEquipmentReply
// @Failure 400 {object} ErrorReply
// @Failure 403 {object} ErrorReply
// @Router /api/user/{user_id}/equipment [post]
func (self *EquipmentController) Post(c *gin.Context) {
	user, _, ok := self.userAndPathID(c)
	if !ok {
		return
	}

	var req models.PostEquipmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	equipment, err := self.repo.Create(&models.Equipment{
		UserID:            user.ID,
		Name:              req.Name,
		Description:       req.Description,
		StartUsageMeters:  req.StartUsageMeters,
		ExpectedUsage:     req.ExpectedUsage,
		PreferredForSport: req.PreferredForSport,
	})
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, PostEquipmentReply{Data: *equipment})
}

// Patch updates a piece of equipment owned by the user.
// @Summary Update a piece of equipment
// @Tags Equipment
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param user_id path string true "User ID"
// @Param equipment body models.PatchEquipmentRequest true "Equipment fields to update"
// @Success 200 {object} PostEquipmentReply
// @Failure 400 {object} ErrorReply
// @Failure 403 {object} ErrorReply
// @Router /api/user/{user_id}/equipment [patch]
func (self *EquipmentController) Patch(c *gin.Context) {
	user, _, ok := self.userAndPathID(c)
	if !ok {
		return
	}

	var req models.PatchEquipmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	if err := self.repo.Update(&models.EquipmentUpdate{
		ID:                 req.ID,
		UserID:             user.ID,
		Name:               req.Name,
		Description:        req.Description,
		StartUsageMeters:   req.StartUsageMeters,
		ExpectedUsage:      req.ExpectedUsage,
		ClearExpectedUsage: req.ClearExpectedUsage,
		PreferredForSport:  req.PreferredForSport,
	}); err != nil {
		SetGinError(c, http.StatusNotFound, err)
		return
	}

	equipment, err := self.repo.FetchByUserID(user.ID)
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	for _, item := range equipment {
		if item.ID == req.ID {
			c.JSON(http.StatusOK, PostEquipmentReply{Data: item.Equipment})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "equipment updated successfully"})
}

// Delete removes a piece of equipment and all of its sport links.
// @Summary Delete a piece of equipment
// @Tags Equipment
// @Produce json
// @Security CookieAuth
// @Param user_id path string true "User ID"
// @Param equipment_id path string true "Equipment ID"
// @Success 200 {object} ErrorReply
// @Failure 400 {object} ErrorReply
// @Failure 403 {object} ErrorReply
// @Router /api/user/{user_id}/equipment/{equipment_id} [delete]
func (self *EquipmentController) Delete(c *gin.Context) {
	user, _, ok := self.userAndPathID(c)
	if !ok {
		return
	}

	equipmentID, err := models.NewSnowflakeFromString(c.Param("equipment_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("invalid equipment_id: %w", err))
		return
	}
	if err := self.repo.DeleteByID(equipmentID, user.ID); err != nil {
		SetGinError(c, http.StatusNotFound, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "equipment deleted successfully"})
}

// LinkSports links one or more sport entries to a piece of equipment.
// @Summary Link sport entries to a piece of equipment
// @Tags Equipment
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param user_id path string true "User ID"
// @Param equipment_id path string true "Equipment ID"
// @Param links body models.LinkEquipmentSportsRequest true "Sport entries to link"
// @Success 200 {object} ErrorReply
// @Failure 400 {object} ErrorReply
// @Failure 403 {object} ErrorReply
// @Router /api/user/{user_id}/equipment/{equipment_id}/sports [post]
func (self *EquipmentController) LinkSports(c *gin.Context) {
	user, _, ok := self.userAndPathID(c)
	if !ok {
		return
	}

	equipmentID, err := models.NewSnowflakeFromString(c.Param("equipment_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("invalid equipment_id: %w", err))
		return
	}

	var req models.LinkEquipmentSportsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	if err := self.repo.LinkSports(equipmentID, user.ID, req.SportIDs); err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "sport entries linked successfully"})
}

// UnlinkSport removes the link between a sport entry and a piece of equipment.
// @Summary Unlink a sport entry from a piece of equipment
// @Tags Equipment
// @Produce json
// @Security CookieAuth
// @Param user_id path string true "User ID"
// @Param equipment_id path string true "Equipment ID"
// @Param sport_id path string true "Sport ID"
// @Success 200 {object} ErrorReply
// @Failure 400 {object} ErrorReply
// @Failure 403 {object} ErrorReply
// @Router /api/user/{user_id}/equipment/{equipment_id}/sports/{sport_id} [delete]
func (self *EquipmentController) UnlinkSport(c *gin.Context) {
	user, _, ok := self.userAndPathID(c)
	if !ok {
		return
	}

	equipmentID, err := models.NewSnowflakeFromString(c.Param("equipment_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("invalid equipment_id: %w", err))
		return
	}
	sportID, err := models.NewSnowflakeFromString(c.Param("sport_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, fmt.Errorf("invalid sport_id: %w", err))
		return
	}

	if err := self.repo.UnlinkSport(equipmentID, user.ID, sportID); err != nil {
		SetGinError(c, http.StatusNotFound, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "sport entry unlinked successfully"})
}
