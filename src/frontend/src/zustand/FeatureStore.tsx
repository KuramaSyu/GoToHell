import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Serializable shape for a feature flag.
 *
 * This type is used for persistence and for converting from/to class instances.
 */
interface FeatureFlagRecord {
  name: string;
  description: string;
  enabled: boolean;
}

/**
 * Runtime feature flag object.
 */
interface IFeatureFlag {
  name: string;
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
  name: string;
  description: string;
  enabled: boolean;

  constructor(name: string, description: string, enabled: boolean) {
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

/**
 * Enum with all feature flag names for autocompletion
 */
export enum FeatureFlagName {
  StartupStreaks = 'StartupStreaks',
  PersonalGoals = 'PersonalGoals',
  SwapBackgroundOnUpload = 'SwapBackgroundOnUpload',
}

type FeatureFlags = Record<FeatureFlagName, IFeatureFlag>;

/**
 * Defaults as plain records. These are the source of truth for reset/hydration.
 */
const DEFAULT_FEATURE_FLAG_RECORDS: Record<FeatureFlagName, FeatureFlagRecord> =
  {
    [FeatureFlagName.StartupStreaks]: {
      name: 'Startup Streaks',
      description: 'Show the sidecard with streaks when opening the page',
      enabled: true,
    },
    [FeatureFlagName.PersonalGoals]: {
      name: 'Personal Goals',
      description: 'Show the Personal Goals icon in the App Bar',
      enabled: false,
    },
    [FeatureFlagName.SwapBackgroundOnUpload]: {
      name: 'Swap Background On Upload',
      description:
        'When playing for a longer period of time, the same background gets quite annoying. Hence this feature, to automatically swap the background, when clicking Upload',
      enabled: true,
    },
  };

export const FeatureFlagNames = Object.values(FeatureFlagName);

/**
 * Returns fresh runtime feature flag instances from defaults.
 */
const getDefaultFeatureFlags = (): FeatureFlags => ({
  [FeatureFlagName.StartupStreaks]: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.StartupStreaks],
  ),
  [FeatureFlagName.PersonalGoals]: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.PersonalGoals],
  ),
  [FeatureFlagName.SwapBackgroundOnUpload]: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.SwapBackgroundOnUpload],
  ),
});

/**
 * Rebuilds runtime feature flags from persisted state while keeping defaults
 * for missing fields.
 */
const hydrateFeatureFlags = (
  persistedFlags?: Partial<Record<FeatureFlagName, Partial<FeatureFlagRecord>>>,
): FeatureFlags => ({
  [FeatureFlagName.StartupStreaks]: SimpleFeatureFlag.fromRecord({
    ...DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.StartupStreaks],
    ...(persistedFlags?.[FeatureFlagName.StartupStreaks] ?? {}),
  }),
  [FeatureFlagName.PersonalGoals]: SimpleFeatureFlag.fromRecord({
    ...DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.PersonalGoals],
    ...(persistedFlags?.[FeatureFlagName.PersonalGoals] ?? {}),
  }),
  [FeatureFlagName.SwapBackgroundOnUpload]: SimpleFeatureFlag.fromRecord({
    ...DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.SwapBackgroundOnUpload],
    ...(persistedFlags?.[FeatureFlagName.SwapBackgroundOnUpload] ?? {}),
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
