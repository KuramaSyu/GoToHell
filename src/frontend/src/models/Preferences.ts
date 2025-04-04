// used for custom overrides, if default definitions are not good enough
export interface OverrideSportDefinition {
  sport: string;
  game: string;
  amount: number;
}
export interface DefaultSportsDefinition {
  sport: string | null;
  sport_multiplier: number | null;
  game: string | null;
  game_multiplier: number | null;
}

interface Multiplier {
  game: string | null; // null means it's used global
  multiplier: number;
}
export interface UserPreferences {
  game_overrides: OverrideSportDefinition[];
  multipliers: Multiplier[];
}
