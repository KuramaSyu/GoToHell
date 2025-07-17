package models

import (
	"fmt"
	"strconv"
	"strings"
)

type Snowflake uint64

func (s Snowflake) MarshalJSON() ([]byte, error) {
	// defining quotes manually is required
	return []byte(fmt.Sprintf("\"%d\"", s)), nil
}

func (s *Snowflake) UnmarshalJSON(data []byte) error {
	str := string(data)
	if len(str) > 0 && str[0] == '"' {
		// Remove quotes
		var err error
		str, err = strconv.Unquote(str)
		if err != nil {
			return err
		}
	}

	decoded, err := strconv.ParseUint(str, 10, 64)
	if err != nil {
		return err
	}
	*s = Snowflake(decoded)
	return nil
}

// NewSnowflakeFromString converts a string to a Snowflake.
func NewSnowflakeFromString(s string) (Snowflake, error) {
	v, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0, err
	}
	return Snowflake(v), nil
}

// SnowflakeArray is a custom type to handle comma-separated snowflake IDs in query parameters.
type SnowflakeArray struct {
	IDs []Snowflake
}

// UnmarshalText implements the encoding.TextUnmarshaler interface,
// allowing Gin to bind comma-separated strings to a slice of Snowflakes.
func (a *SnowflakeArray) UnmarshalText(text []byte) error {
	str := string(text)
	if str == "" {
		*a = SnowflakeArray{}
		return nil
	}
	parts := strings.Split(str, ",")
	snowflakes := make([]Snowflake, len(parts))
	for i, part := range parts {
		id, err := NewSnowflakeFromString(part)
		if err != nil {
			return fmt.Errorf("invalid snowflake ID: %s", part)
		}
		snowflakes[i] = id
	}
	a.IDs = snowflakes
	return nil
}
