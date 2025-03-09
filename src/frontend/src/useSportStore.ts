import {create} from 'zustand';

interface SportStore {
    currentSport: Sport | null;
    setSport: (sport: Sport | null) => void;
}
export interface Sport {
    kind: string;
    game: string;
    death_multiplier: number;
}

export const useSportStore = create<SportStore>((set) => ({
    currentSport: null,
    setSport: (sport: Sport | null) => set({ currentSport: sport }),
}));

