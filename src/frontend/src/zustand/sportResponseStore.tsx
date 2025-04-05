import { create } from 'zustand';
import { GetSportsResponse } from '../models/Sport';

interface SportResponseState {
  sportResponse: GetSportsResponse | null;
  setSportResponse: (sportResponse: GetSportsResponse) => void;
}

export const useSportResponseStore = create<SportResponseState>((set) => ({
  sportResponse: null,
  setSportResponse: (sportResponse: GetSportsResponse) =>
    set({ sportResponse: sportResponse }),
}));
