package db

import (
	"github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
)

type IUserDetailsFacade interface {
	GetDetails(userID models.Snowflake, requestingUserID models.Snowflake) ([]models.GetUserDetailsReply, error)
}

type UserDetailsFacade struct {
	SportRepo         SportRepository
	UserRepo          UserRepository
	PersonalGoalsRepo repositories.PersonalGoalsRepository
}

func (f *UserDetailsFacade) GetDetails(userID models.Snowflake, requestingUserID models.Snowflake) ([]models.GetUserDetailsReply, error) {

	return []models.GetUserDetailsReply{}, nil
}

func NewUserDetailsFacade(
	sportRepo SportRepository,
	userRepo UserRepository,
	personalGoalsRepo repositories.PersonalGoalsRepository,
) IUserDetailsFacade {
	return &UserDetailsFacade{
		SportRepo:         sportRepo,
		UserRepo:          userRepo,
		PersonalGoalsRepo: personalGoalsRepo,
	}
}
