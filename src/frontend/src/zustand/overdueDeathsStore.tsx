import { create } from 'zustand';
import { OverdueDeaths } from '../utils/api/replies/OverdueDeaths';

interface OverdueDeathsState {
  overdueDeathsList: OverdueDeaths[];
  loaded: boolean;
  setOverdueDeaths: (overdueDeathsList: OverdueDeaths[]) => void;
}

export const useStreakStore = create<OverdueDeathsState>((set) => ({
  overdueDeathsList: [],
  loaded: false,
  setOverdueDeaths: (overdueDeathsList: OverdueDeaths[]) =>
    set({
      overdueDeathsList: overdueDeathsList,
      loaded: true,
    }),
}));
