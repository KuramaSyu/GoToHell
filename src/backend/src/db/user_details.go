package db

import (
	"fmt"

	"github.com/KuramaSyu/GoToHell/src/backend/src/api/repositories"
	"github.com/KuramaSyu/GoToHell/src/backend/src/models"
)

type IUserDetailsFacade interface {
	GetDetails(userID models.Snowflake, requestingUserID models.Snowflake) (models.GetUserDetailsReply, error)
}

type UserDetailsFacade struct {
	SportRepo         SportRepository
	UserRepo          UserRepository
	PersonalGoalsRepo repositories.PersonalGoalsRepository
	FriendshipRepo    FriendshipRepository
}

func (s *UserDetailsFacade) GetDetails(
	userID models.Snowflake,
	requestingUserID models.Snowflake,
) (models.GetUserDetailsReply, error) {

	// check if they are friends and exit otherwise
	statusPositive, _ := s.FriendshipRepo.HavePositiveFriendshipStatus(userID, requestingUserID)
	if !statusPositive {
		return models.GetUserDetailsReply{}, fmt.Errorf("There is no friendship between %v and %v", userID, requestingUserID)
	}

	// get username, discriminator (# value) and avatar
	userInfo, err := s.UserRepo.GetUserByID(userID)
	if err != nil {
		return models.GetUserDetailsReply{}, err
	}

	// get streaks
	currentStreak, err := s.SportRepo.GetCurrentStreak(userID)
	if err != nil {
		return models.GetUserDetailsReply{}, err
	}
	LongestStreak, err := s.SportRepo.GetLongestStreak(userID)
	if err != nil {
		return models.GetUserDetailsReply{}, err
	}

	// get last activities
	LastActivities, err := s.SportRepo.GetSports([]models.Snowflake{userID}, 50, 0)
	if err != nil {
		return models.GetUserDetailsReply{}, err
	}

	// get goals
	goals, err := s.PersonalGoalsRepo.FetchByUserID(userID, requestingUserID)
	if err != nil {
		return models.GetUserDetailsReply{}, err
	}

	// build up response
	details := models.GetUserDetailsReply{
		ID:             userID,
		Username:       userInfo.Username,
		Discriminator:  userInfo.Discriminator,
		Avatar:         userInfo.Avatar,
		CurrentStreak:  currentStreak,
		LongestStreak:  LongestStreak,
		Goals:          goals,
		LastActivities: LastActivities,
	}
	return details, nil
}

func NewUserDetailsFacade(
	sportRepo SportRepository,
	userRepo UserRepository,
	personalGoalsRepo repositories.PersonalGoalsRepository,
	friendshipRepo FriendshipRepository,

) IUserDetailsFacade {
	return &UserDetailsFacade{
		SportRepo:         sportRepo,
		UserRepo:          userRepo,
		PersonalGoalsRepo: personalGoalsRepo,
		FriendshipRepo:    friendshipRepo,
	}
}
