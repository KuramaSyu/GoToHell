package controllers

import (
	"net/http"

	"github.com/KuramaSyu/GoToHell/src/backend/src/db"
	. "github.com/KuramaSyu/GoToHell/src/backend/src/models"
	"github.com/gin-gonic/gin"
)

type UserDetailsData struct {
	ID        Snowflake     `gorm:"primaryKey" json:"id"`
	UserID    Snowflake     `gorm:"not null;index" json:"user_id"`
	Amount    int           `json:"amount"`
	Frequency TimeFrequency `json:"frequency"`
	Sport     string        `json:"sport"`
}

type GetUserDetailsQuery struct {
}

func NewPersonalDetailsController(repo db.IUserDetailsFacade) *PersonalDetailsController {
	return &PersonalDetailsController{
		repo: repo,
	}
}

// PersonalDetailsController manages personal details endpoints.
type PersonalDetailsController struct {
	repo db.IUserDetailsFacade
}

// returns a user with deeper insights
// @Summary A user with sport, streak and goal data
// @Produce json
// @Accept json
// @Success 200 {object} GetUserDetailsReply
// @Failure 400 {object} ErrorReply
// @Router /{user_id}/details [get]
func (self *PersonalDetailsController) Get(c *gin.Context) {
	// var query GetUserDetailsReply

	// if err := c.ShouldBindQuery(&query); err != nil {
	// 	SetGinError(c, http.StatusBadRequest, err)
	// }
	requesting_user, status, err := UserFromSession(c)
	if err != nil {
		SetGinError(c, status, err)
		return
	}
	requested_user_id, err := NewSnowflakeFromString(c.Param("user_id"))
	if err != nil {
		SetGinError(c, http.StatusBadRequest, err)
		return
	}

	reply, err := self.repo.GetDetails(requested_user_id, requesting_user.ID)
	if err != nil {
		SetGinError(c, http.StatusForbidden, err)
		return
	}
	c.JSON(http.StatusOK, reply)
}
