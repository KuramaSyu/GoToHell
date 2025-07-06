import { create } from 'zustand';
import { OverdueDeaths } from '../models/OverdueDeaths';

interface OverdueDeathsState {
  overdueDeathsList: OverdueDeaths[];
  loaded: boolean;
  setOverdueDeaths: (overdueDeathsList: OverdueDeaths[]) => void;
}

export const useOverdueDeathsStore = create<OverdueDeathsState>((set) => ({
  overdueDeathsList: [],
  loaded: false,
  setOverdueDeaths: (overdueDeathsList: OverdueDeaths[]) =>
    set({
      overdueDeathsList: overdueDeathsList,
      loaded: true,
    }),
}));
