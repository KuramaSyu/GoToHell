package controllers

import (
	"net/http"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetOverdueDeathsReply is the reply sent when doing [get] /overdue_deaths
// swagger:model GetOverdueDeathsReply
type GetOverdueDeathsReply struct {
	Data []OverdueDeaths `json:"data"`
}

// swagger:model PostOverdueDeathsRequest
type PostOverdueDeathsRequest struct {
	Game  string `json:"game" binding:"required" example:"overwatch"`
	Count int64  `json:"count" binding:"required" example:"42"`
}

// PostOverdueDeathsReply is the reply sent when doing [post] /overdue_deaths
// swagger:model PostOverdueDeathsReply
type PostOverdueDeathsReply struct {
	Data OverdueDeaths `json:"data"`
}

// FriendsController manages friendship endpoints.
type OverdueDeathsController struct {
	repo OverdueDeathRepository
}

func NewOverdueDeathsController(database *gorm.DB) *OverdueDeathsController {
	return &OverdueDeathsController{repo: &db.GormOverdueDeathsRepository{DB: database}}
}

// returns all OverdueDeaths records for the user
// @Summary Get all OverdueDeaths records for the logged in user
// @Tags OverdueDeaths
// @Produce json
// @Accept json
// @Security CoockieAuth
// @Success 200 {object} GetOverdueDeathsReply
// @Failure 400 {object} ErrorReply
// @Router /api/overdue_deaths [get]
func (oc *OverdueDeathsController) Get(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}

	overdueDeaths, err := oc.repo.FetchAll(user.ID)
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	reply := GetOverdueDeathsReply{
		Data: overdueDeaths,
	}
	c.JSON(http.StatusOK, reply)
}

// @Summary Creates or updates the death <count> for the given <game> of the logged in user
// @Tags OverdueDeaths
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param request body PostOverdueDeathsRequest true "Payload containing the game and count"
// @Success 200 {object} PostOverdueDeathsReply
// @Failure 400 {object} ErrorReply
// @Router /api/overdue_deaths [post]
func (oc *OverdueDeathsController) Post(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}

	var req PostOverdueDeathsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	data, err := oc.repo.SetCount(user.ID, req.Game, req.Count)
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, PostOverdueDeathsReply{Data: *data})
}

func SetGinError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{"error": err})

}
