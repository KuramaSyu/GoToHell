import { create } from 'zustand';

interface AppBackgroundState {
  /**
   * One-shot multiplier for the next generated theme's
   * `transitions.duration.complex`.
   *
   * 1 = normal speed, 2 = half speed.
   */
  nextChangeSpeedMultiplier: number;

  /**
   * Sets the multiplier for the next generated theme transition duration.
   */
  setNextChangeSpeedMultiplier: (multiplier: number) => void;

  /**
   * Convenience helper: make the next generated theme transition run at half speed.
   */
  markNextBackgroundChangeSlow: () => void;

  /**
   * Returns current multiplier and resets it back to normal speed (1).
   */
  consumeNextChangeSpeedMultiplier: () => number;
}

const useAppBackgroundStore = create<AppBackgroundState>((set, get) => ({
  nextChangeSpeedMultiplier: 1,

  setNextChangeSpeedMultiplier: (multiplier: number) =>
    set({
      nextChangeSpeedMultiplier:
        Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1,
    }),

  markNextBackgroundChangeSlow: () =>
    set({
      nextChangeSpeedMultiplier: 5,
    }),

  consumeNextChangeSpeedMultiplier: () => {
    const multiplier = get().nextChangeSpeedMultiplier;
    set({ nextChangeSpeedMultiplier: 1 });
    return multiplier;
  },
}));

export default useAppBackgroundStore;
