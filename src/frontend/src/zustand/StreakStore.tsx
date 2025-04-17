import { create } from 'zustand';

interface StreakState {
  streak: number;
  setStreak: (streak: number) => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: 0,
  setStreak: (streak: number) => set({ streak: streak }),
}));
