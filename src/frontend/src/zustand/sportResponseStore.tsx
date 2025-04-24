import { create } from 'zustand';
import { GetSportsResponse } from '../models/Sport';

interface SportResponseState {
  sportResponse: GetSportsResponse | null;
  setSportResponse: (sportResponse: GetSportsResponse) => void;
  emptySportsResponse: () => GetSportsResponse;
}

export const useSportResponseStore = create<SportResponseState>((set) => ({
  sportResponse: null,
  setSportResponse: (sportResponse: GetSportsResponse) =>
    set({ sportResponse: sportResponse }),
  emptySportsResponse: () => {
    return { games: {}, sports: {} };
  },
}));
