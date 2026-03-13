import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FeatureState {
  flags: {
    StartupStreaks: boolean;
  };
  setFlag: (name: keyof FeatureState['flags'], value: boolean) => void;
}

const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      flags: {
        StartupStreaks: true,
      },
      setFlag: (name, value) =>
        set((state) => ({ flags: { ...state.flags, [name]: value } })),
    }),
    {
      name: 'feature-flags',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
