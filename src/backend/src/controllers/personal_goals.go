package controllers

import (
	"fmt"
	"net/http"

	. "github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
)

type PersonalGoalData struct {
	ID        Snowflake     `gorm:"primaryKey" json:"id"`
	UserID    Snowflake     `gorm:"not null;index" json:"user_id"`
	Amount    int           `json:"amount"`
	Frequency TimeFrequency `json:"frequency"`
	Sport     string        `json:"sport"`
}

func PersonalGoalDataFrom(p *PersonalGoal) PersonalGoalData {
	return PersonalGoalData{
		ID:        p.ID,
		UserID:    p.UserID,
		Amount:    p.Amount,
		Frequency: p.Frequency,
		Sport:     p.Sport,
	}
}

func PersonalGoalDataFromList(p_list []PersonalGoal) []PersonalGoalData {
	var l = []PersonalGoalData{}
	for _, p := range p_list {
		l = append(l, PersonalGoalDataFrom(&p))
	}
	return l
}

// GetPersonalGoalsReply is the reply sent when doing [get] /{user_id}/goals
// swagger:model GetPersonalGoalsReply
type GetPersonalGoalsReply struct {
	Data []PersonalGoalData `json:"data"`
}

// PostPersonalGoalsRequest is the request sent when doing [post] /{user_id}/goals
// swagger:model PostPersonalGoalsRequest
type PostPersonalGoalsRequest struct {
	Amount    int           `json:"amount" binding:"required"`
	Frequency TimeFrequency `json:"frequency" binding:"required"`
	Sport     string        `json:"sport" binding:"required"`
}

// PatchPutPersonalGoalsRequest is the request sent when doing [patch] /{user_id}/goals
// swagger:model PatchPutPersonalGoalsRequest
type PatchPutPersonalGoalsRequest struct {
	ID        Snowflake     `json:"id,omitempty"` // post does not require ID, patch/put does
	Amount    int           `json:"amount" binding:"required"`
	Frequency TimeFrequency `json:"frequency" binding:"required"`
	Sport     string        `json:"sport" binding:"required"`
}

// DeletePersonalGoalsRequest is the request sent when doing [delete] /{user_id}/goals
// swagger:model DeletePersonalGoalsRequest
type DeletePersonalGoalsRequest struct {
	ID Snowflake `json:"id" binding:"required"`
}

func NewPersonalGoalsController(personalGoalsRepo PersonalGoalsRepository) *PersonalGoalsController {
	return &PersonalGoalsController{
		repo: personalGoalsRepo,
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
		Data: PersonalGoalDataFromList(goals),
	}
	c.JSON(http.StatusOK, reply)
}

// @Summary Creates a personal goal
// @Tags PersonalGoals
// @Accept json
// @Produce json
// @Param request body PostPersonalGoalsRequest true "Payload containing the personal goal details like amount, frequency and sport"
// @Success 200 {object} GetPersonalGoalsReply
// @Failure 400 {object} ErrorReply
// @Router /api/{user_id}/goals [post]
func (self *PersonalGoalsController) Post(c *gin.Context) {
	HandlePersonalGoalsModification(c, self.repo.Insert, nil)
}

// @Summary Updates a personal goal
// @Tags PersonalGoals
// @Accept json
// @Produce json
// @Param request body PatchPutPersonalGoalsRequest true "Payload containing the personal goal details like id, amount, frequency and sport"
// @Success 200 {object} GetPersonalGoalsReply
// @Failure 400 {object} ErrorReply
// @Router /api/{user_id}/goals [patch]
func (self *PersonalGoalsController) Patch(c *gin.Context) {
	HandlePersonalGoalsModification(c, self.repo.Update, nil)
}

// @Summary Updates a personal goal
// @Tags PersonalGoals
// @Accept json
// @Produce json
// @Param request body PatchPutPersonalGoalsRequest true "Payload containing the personal goal details like id, amount, frequency and sport"
// @Success 200 {object} GetPersonalGoalsReply
// @Failure 400 {object} ErrorReply
// @Router /api/{user_id}/goals [put]
func (self *PersonalGoalsController) Put(c *gin.Context) {
	HandlePersonalGoalsModification(c, self.repo.Update, nil)
}

// @Summary Deletes a personal goal
// @Tags PersonalGoals
// @Accept json
// @Produce json
// @Param request body DeletePersonalGoalsRequest true "Payload containing the personal goal ID"
// @Success 200 {object} GetPersonalGoalsReply
// @Failure 400 {object} ErrorReply
// @Router /api/{user_id}/goals [delete]
func (self *PersonalGoalsController) Delete(c *gin.Context) {
	// the user is extracted from the session and inserted as user into the goal. Based on this,
	// checks will be done, if the user is allowed to delete the goal.
	var req DeletePersonalGoalsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}
	// user id gets added later
	goal := &PersonalGoal{
		ID: req.ID,
	}
	HandlePersonalGoalsModification(c, self.repo.DeleteByID, goal)
}

// Define a function type matching the signature of the repo methods
type PersonalGoalsFunc func(*PersonalGoal) (*PersonalGoal, error)

// Since Post/Put/Patch share the same logic, we can create a generic handler
// which takes a repo method as an argument.
func HandlePersonalGoalsModification(
	c *gin.Context,
	method PersonalGoalsFunc,
	goal *PersonalGoal,
) {
	requested_user_id, err := NewSnowflakeFromString(c.Param("user_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}

	if user.ID != requested_user_id {
		SetGinError(c, http.StatusForbidden, fmt.Errorf("Cannot modify another user's personal goals"))
		return
	}

	if goal == nil {
		var req PostPersonalGoalsRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			SetGinError(c, http.StatusBadRequest, err)
			return
		}
		goal = &PersonalGoal{
			UserID:    user.ID,
			Amount:    req.Amount,
			Frequency: req.Frequency,
			Sport:     req.Sport,
		}
	} else {
		// used when deleting, since it's deserialized on DeletePersonalGoalRequest
		goal.UserID = user.ID
	}

	createdGoal, err := method(goal)
	if err != nil {
		SetGinError(c, http.StatusInternalServerError, err)
		return
	}
	reply := GetPersonalGoalsReply{
		Data: []PersonalGoalData{PersonalGoalDataFrom(createdGoal)},
	}
	c.JSON(http.StatusOK, reply)
}
