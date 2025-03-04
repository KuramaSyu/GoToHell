package models

import "fmt"

// Discord User Representation
type User struct {
	ID            string `json:"id"`
	Username      string `json:"username"`
	Discriminator string `json:"discriminator"`
	Avatar        string `json:"avatar"`
	Email         string `json:"email"`
}

// GetAvatarURL returns the user's Discord avatar URL
func (u *User) GetAvatarURL() string {
	return fmt.Sprintf("https://cdn.discordapp.com/avatars/%v/%v.png", u.ID, u.Avatar)
}
