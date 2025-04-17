import { create } from 'zustand';

interface StreakState {
  streak: number | null;
  setStreak: (streak: number) => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,
  setStreak: (streak: number) => set({ streak: streak }),
}));
