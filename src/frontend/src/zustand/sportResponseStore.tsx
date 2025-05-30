import { create } from 'zustand';
import { GetSportsResponse } from '../models/Sport';
import multiplierData from '../utils/data/Multipliers.json';

const data: GetSportsResponse = multiplierData;
interface SportResponseState {
  sportResponse: GetSportsResponse | null;
  setSportResponse: (sportResponse: GetSportsResponse) => void;
  emptySportsResponse: () => GetSportsResponse;
}

export const useSportResponseStore = create<SportResponseState>((set) => ({
  sportResponse: multiplierData,
  setSportResponse: (sportResponse: GetSportsResponse) =>
    set({ sportResponse: sportResponse }),
  emptySportsResponse: () => {
    return { games: {}, sports: {} };
  },
}));
