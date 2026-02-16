package controllers

import (
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

}
