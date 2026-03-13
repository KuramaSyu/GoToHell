import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FeatureFlagName = 'StartupStreaks' | 'PersonalGoals';

interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
}

type FeatureFlags = Record<FeatureFlagName, FeatureFlag>;

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  StartupStreaks: {
    name: 'Startup Streak Overview',
    description: 'Show the sidecard with streaks when opening the page',
    enabled: true,
  },
  PersonalGoals: {
    name: 'Personal Goals',
    description: 'Show the Personal Goals icon in the App Bar',
    enabled: false,
  },
};

const getDefaultFeatureFlags = (): FeatureFlags => ({
  StartupStreaks: { ...DEFAULT_FEATURE_FLAGS.StartupStreaks },
  PersonalGoals: { ...DEFAULT_FEATURE_FLAGS.PersonalGoals },
});

interface FeatureState {
  flags: FeatureFlags;
  setFlag: (name: FeatureFlagName, value: boolean) => void;
  resetFlags: () => void;
}

const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      flags: getDefaultFeatureFlags(),
      setFlag: (name, value) =>
        set((state) => ({
          flags: {
            ...state.flags,
            [name]: {
              ...state.flags[name],
              enabled: value,
            },
          },
        })),
      resetFlags: () =>
        set({
          flags: getDefaultFeatureFlags(),
        }),
    }),
    {
      name: 'feature-flags',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useFeatureStore;
