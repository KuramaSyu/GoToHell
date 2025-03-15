import { create } from 'zustand';

interface SportStore {
  currentSport: SportDefinition | null;
  setSport: (sport: SportDefinition | null) => void;
}

export interface SportDefinition {
  kind: string;
  game: string;
  death_multiplier: number;
}

export const useSportStore = create<SportStore>((set) => ({
  currentSport: null,
  setSport: (sport: SportDefinition | null) => set({ currentSport: sport }),
}));
