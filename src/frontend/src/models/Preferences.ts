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

export interface Multiplier {
  game: string | null; // null means it's used global
  sport: string | null; // null means it's used for all sports
  multiplier: number;
}
export interface UserPreferences {
  game_overrides: OverrideSportDefinition[];
  multipliers: Multiplier[];
  sport_specific: SportSpecific;
  ui: UIPreferences;
  max_deaths: number;
  other: OtherPreferences;
}

export interface OtherPreferences {
  instant_open_modal: boolean; // whether or not to open the quick action modal with every key
}

export interface UIPreferences {
  displayedGames: string[] | null; // null means, all Games will be shown
  displayedSports: string[] | null; // null means, all Sports will be shown
}

export interface SportSpecific {
  plank: PlankSettings;
}

export interface PlankSettings {
  seconds: number; // this number will be the amount of seconds, with max_deaths
}

export function defaultPreferences(): UserPreferences {
  return {
    game_overrides: [],
    multipliers: [],
    ui: {
      displayedGames: ['league', 'overwatch', 'repo', 'custom'],
      displayedSports: null,
    },
    sport_specific: {
      plank: {
        seconds: 180,
      },
    },
    max_deaths: 10,
    other: {
      instant_open_modal: true,
    },
  };
}
