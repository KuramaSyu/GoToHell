package controllers

import (
	"net/http"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPersonalGoalsReply is the reply sent when doing [get] /{user_id}/goals
// swagger:model GetPersonalGoalsReply
type GetPersonalGoalsReply struct {
	Data []PersonalGoal `json:"data"`
}

func NewPersonalGoalsController(database *gorm.DB) *PersonalGoalsController {
	return &PersonalGoalsController{
		repo: db.NewPersonalGoalsRepository(database),
	}
}

// PersonalGoalsController manages personal goals endpoints.
type PersonalGoalsController struct {
	repo PersonalGoalsRepository
}

// returns all PersonalGoal records for the user
// @Summary Get all PersonalGoal records for the requested user
// @Tags PersonalGoals
// @Produce json
// @Accept json
// @Success 200 {object} GetPersonalGoalsReply
// @Failure 400 {object} ErrorReply
// @Router /{user_id}/goals [get]
func (self *PersonalGoalsController) Get(c *gin.Context) {
	requested_user_id, err := NewSnowflakeFromString(c.Param("user_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, err)
	}
	requesting_user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}
	goals, err := self.repo.FetchByUserID(requested_user_id, requesting_user.ID)
	reply := GetPersonalGoalsReply{
		Data: goals,
	}
	c.JSON(http.StatusOK, reply)
}

// @Summary Creates a personal goal
// @Tags PersonalGoals
// @Accept json
// @Produce json
// @Param request body PostPersonalGoalsRequest true "Payload containing the game and count"
// @Success 200 {object} GetPersonalGoalsReply
// @Failure 400 {object} ErrorReply
// @Router /api/{user_id}/goals [post]
func (self *PersonalGoalsController) Post(c *gin.Context) {
	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}
}
