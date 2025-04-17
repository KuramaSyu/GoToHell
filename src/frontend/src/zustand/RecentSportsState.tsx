import { create } from 'zustand';
import { SportsApiResponse } from '../models/Sport';

interface RecentSportsState {
  refreshTrigger: number;
  recentSports: SportsApiResponse | null;
  triggerRefresh: () => void;
  setRecentSports: (recentSports: SportsApiResponse | null) => void;
}

export const useRecentSportsStore = create<RecentSportsState>((set) => ({
  refreshTrigger: 0,
  recentSports: null,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  setRecentSports: (recentSports: SportsApiResponse | null) =>
    set({ recentSports: recentSports }),
}));
