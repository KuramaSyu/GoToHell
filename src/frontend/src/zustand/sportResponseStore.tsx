import { create } from 'zustand';
import { GetSportsResponse } from '../models/Sport';
import multiplierData from '../utils/data/Multipliers.json';
import { Multiplier } from '../models/Preferences';

const data: GetSportsResponse = multiplierData;
interface SportResponseState {
  sportResponse: GetSportsResponse;
  setSportResponse: (sportResponse: GetSportsResponse) => void;
  emptySportsResponse: () => GetSportsResponse;
  getSportMultiplier: (sport: string) => Multiplier;
}

export const useSportResponseStore = create<SportResponseState>((set) => ({
  sportResponse: multiplierData,
  setSportResponse: (sportResponse: GetSportsResponse) =>
    set({ sportResponse: sportResponse }),
  emptySportsResponse: () => {
    return { games: {}, sports: {} };
  },
  getSportMultiplier: (sport: string) => {
    const { sports } = useSportResponseStore.getState().sportResponse;
    if (sports === undefined) {
      return {
        game: null,
        multiplier: 1,
        sport: sport,
      };
    }
    const multiplier: Multiplier = {
      game: null,
      multiplier: sports[sport] ?? 1,
      sport: sport,
    };
    return multiplier;
  },
}));
