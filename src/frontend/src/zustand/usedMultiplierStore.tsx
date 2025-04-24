import { create } from 'zustand';

interface usedMultiplierState {
  /**
   * undefined means it's not set - more or less auto; null means global; string means the game
   */
  usedMultiplier: string | null | undefined;
  /**
   * undefined means it's not set - more or less auto; null means global; string means the game
   */
  setUsedMultiplier: (usedMultiplier: string | null | undefined) => void;
}

export const useUsedMultiplierStore = create<usedMultiplierState>((set) => ({
  usedMultiplier: undefined,
  setUsedMultiplier: (usedMultiplier: string | null | undefined) =>
    set({ usedMultiplier: usedMultiplier }),
}));
