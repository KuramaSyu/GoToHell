package models

// swagger:model SportAmount
type SportAmount struct {
	Kind   string `json:"kind" example:"push-up"`
	Amount int    `json:"amount" example:"1238"`
}
