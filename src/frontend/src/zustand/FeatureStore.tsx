import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FeatureFlagName = 'StartupStreaks' | 'PersonalGoals';

/**
 * Serializable shape for a feature flag.
 *
 * This type is used for persistence and for converting from/to class instances.
 */
interface FeatureFlagRecord {
  name: FeatureFlagName;
  description: string;
  enabled: boolean;
}

/**
 * Runtime feature flag object.
 */
interface IFeatureFlag {
  name: FeatureFlagName;
  description: string;
  enabled: boolean;

  /**
   * Checks if the feature flag is enabled. This can be overwritten if
   * the logic is more complex than just checking the `enabled` property.
   */
  isEnabled: () => boolean;

  /**
   * Converts the runtime object to a serializable record.
   */
  toRecord: () => FeatureFlagRecord;
}

/**
 * Basic feature flag implementation with helper conversion methods.
 */
class SimpleFeatureFlag implements IFeatureFlag {
  name: FeatureFlagName;
  description: string;
  enabled: boolean;

  constructor(name: FeatureFlagName, description: string, enabled: boolean) {
    this.name = name;
    this.description = description;
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  toRecord() {
    return {
      name: this.name,
      description: this.description,
      enabled: this.enabled,
    };
  }

  /**
   * Creates a `SimpleFeatureFlag` from a persisted/plain object record.
   */
  static fromRecord(record: FeatureFlagRecord): SimpleFeatureFlag {
    return new SimpleFeatureFlag(
      record.name,
      record.description,
      record.enabled,
    );
  }
}

type FeatureFlags = Record<FeatureFlagName, IFeatureFlag>;

/**
 * Defaults as plain records. These are the source of truth for reset/hydration.
 */
const DEFAULT_FEATURE_FLAG_RECORDS: Record<FeatureFlagName, IFeatureFlag> = {
  StartupStreaks: SimpleFeatureFlag.fromRecord({
    name: 'StartupStreaks',
    description: 'Show the sidecard with streaks when opening the page',
    enabled: true,
  }),
  PersonalGoals: SimpleFeatureFlag.fromRecord({
    name: 'PersonalGoals',
    description: 'Show the Personal Goals icon in the App Bar',
    enabled: false,
  }),
};

/**
 * Returns fresh runtime feature flag instances from defaults.
 */
const getDefaultFeatureFlags = (): FeatureFlags => ({
  StartupStreaks: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS.StartupStreaks,
  ),
  PersonalGoals: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS.PersonalGoals,
  ),
});

/**
 * Rebuilds runtime feature flags from persisted state while keeping defaults
 * for missing fields.
 */
const hydrateFeatureFlags = (
  persistedFlags?: Partial<Record<FeatureFlagName, Partial<FeatureFlagRecord>>>,
): FeatureFlags => ({
  StartupStreaks: SimpleFeatureFlag.fromRecord({
    ...DEFAULT_FEATURE_FLAG_RECORDS.StartupStreaks,
    ...(persistedFlags?.StartupStreaks ?? {}),
    name: 'StartupStreaks',
  }),
  PersonalGoals: SimpleFeatureFlag.fromRecord({
    ...DEFAULT_FEATURE_FLAG_RECORDS.PersonalGoals,
    ...(persistedFlags?.PersonalGoals ?? {}),
    name: 'PersonalGoals',
  }),
});

interface FeatureState {
  /** Current feature flag states keyed by flag name. */
  flags: FeatureFlags;

  /** Enables/disables a feature flag. */
  setFlag: (name: FeatureFlagName, value: boolean) => void;

  /** Resets all feature flags to defaults. */
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
            [name]: SimpleFeatureFlag.fromRecord({
              ...state.flags[name].toRecord(),
              enabled: value,
            }),
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
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<FeatureState>;
        return {
          ...currentState,
          ...persisted,
          flags: hydrateFeatureFlags(
            persisted.flags as Partial<
              Record<FeatureFlagName, Partial<FeatureFlagRecord>>
            >,
          ),
        };
      },
    },
  ),
);

export default useFeatureStore;
