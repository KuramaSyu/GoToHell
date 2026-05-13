import { create } from 'zustand';
import { OverdueDeaths } from '../models/OverdueDeaths';

interface OverdueDeathsState {
  // list of overdue deaths, with game and count
  overdueDeathsList: OverdueDeaths[];

  // whether or not the overdue deaths are fetched (from REST)
  loaded: boolean;

  // sets the overdue deaths list, and marks it as loaded
  setOverdueDeaths: (overdueDeathsList: OverdueDeaths[]) => void;

  // option, to make 'upload' not decrement the overdue deaths count
  lockDecrement: boolean;

  // sets the lock decrement option
  setLockDecrement: (lockDecrement: boolean) => void;
}

export const useOverdueDeathsStore = create<OverdueDeathsState>((set) => ({
  overdueDeathsList: [],
  loaded: false,
  lockDecrement: false,
  setOverdueDeaths: (overdueDeathsList: OverdueDeaths[]) =>
    set({
      overdueDeathsList: overdueDeathsList,
      loaded: true,
    }),
  setLockDecrement: (lockDecrement: boolean) =>
    set({
      lockDecrement: lockDecrement,
    }),
}));
