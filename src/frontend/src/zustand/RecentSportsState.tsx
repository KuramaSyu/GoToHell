import { create } from 'zustand';

interface RecentSportsState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useRecentSportsStore = create<RecentSportsState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
