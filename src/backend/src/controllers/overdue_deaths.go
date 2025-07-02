package controllers

import (
	"net/http"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GetOverdueDeathsReply struct {
	Data []OverdueDeaths `json:"data"`
}

type PostOverdueDeathsRequest struct {
	Game  string `json:"game" binding:"required"`
	Count int64  `json:"count" binding:"required"`
}

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

// inserts/updates a OverdueDeaths record
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
