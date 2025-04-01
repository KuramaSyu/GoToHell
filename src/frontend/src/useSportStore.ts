import { create } from 'zustand';

interface SportStore {
  currentSport: DefaultSportsDefinition;
  setSport: (sport: DefaultSportsDefinition) => void;
}

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

export const useSportStore = create<SportStore>((set) => ({
  currentSport: {
    sport: null,
    sport_multiplier: null,
    game: null,
    game_multiplier: null,
  },
  setSport: (sport: DefaultSportsDefinition) => set({ currentSport: sport }),
}));
