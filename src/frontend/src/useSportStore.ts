import { create } from 'zustand';

interface SportStore {
  currentSport: DefaultSportsDefinition;
  setSport: (sport: DefaultSportsDefinition) => void;
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
