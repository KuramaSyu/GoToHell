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
  /**
   * Whether the user changed this flag explicitly. Used for flags whose
   * default depends on another flag (e.g. equipment upload confirmation).
   */
  modified?: boolean;
}

/**
 * Runtime feature flag object.
 */
interface IFeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  modified: boolean;

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
  modified: boolean;

  constructor(
    name: string,
    description: string,
    enabled: boolean,
    modified = false,
  ) {
    this.name = name;
    this.description = description;
    this.enabled = enabled;
    this.modified = modified;
  }

  isEnabled() {
    return this.enabled;
  }

  toRecord() {
    return {
      name: this.name,
      description: this.description,
      enabled: this.enabled,
      modified: this.modified,
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
      record.modified ?? false,
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
  Equipment = 'Equipment',
  EquipmentUploadConfirmation = 'EquipmentUploadConfirmation',
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
    [FeatureFlagName.Equipment]: {
      name: 'Equipment Tracking',
      description:
        'Track equipment such as running shoes, their usage and which gear is used for an upload',
      enabled: false,
    },
    [FeatureFlagName.EquipmentUploadConfirmation]: {
      name: 'Equipment Upload Confirmation',
      description:
        'Ask before uploading if the upload is not linked to any equipment (e.g. no shoes selected)',
      // Only enabled by default when equipment tracking itself is enabled.
      enabled: false,
      modified: false,
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
  [FeatureFlagName.Equipment]: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.Equipment],
  ),
  [FeatureFlagName.EquipmentUploadConfirmation]: SimpleFeatureFlag.fromRecord(
    DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.EquipmentUploadConfirmation],
  ),
});

/**
 * Rebuilds runtime feature flags from persisted state while keeping defaults
 * for missing fields.
 */
const hydrateFeatureFlags = (
  persistedFlags?: Partial<Record<FeatureFlagName, Partial<FeatureFlagRecord>>>,
): FeatureFlags => {
  const equipmentEnabled = !!(
    persistedFlags?.[FeatureFlagName.Equipment]?.enabled ??
    DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.Equipment].enabled
  );
  const confirmationRecord: FeatureFlagRecord = {
    ...DEFAULT_FEATURE_FLAG_RECORDS[
      FeatureFlagName.EquipmentUploadConfirmation
    ],
    ...(persistedFlags?.[FeatureFlagName.EquipmentUploadConfirmation] ?? {}),
  };

  // The confirmation only makes sense (and is only enabled by default) when
  // equipment tracking is enabled.
  const confirmationEnabled = confirmationRecord.modified
    ? confirmationRecord.enabled
    : equipmentEnabled;

  return {
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
    [FeatureFlagName.Equipment]: SimpleFeatureFlag.fromRecord({
      ...DEFAULT_FEATURE_FLAG_RECORDS[FeatureFlagName.Equipment],
      ...(persistedFlags?.[FeatureFlagName.Equipment] ?? {}),
    }),
    [FeatureFlagName.EquipmentUploadConfirmation]: SimpleFeatureFlag.fromRecord({
      ...confirmationRecord,
      enabled: confirmationEnabled,
    }),
  };
};

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
        set((state) => {
          const flags: FeatureFlags = {
            ...state.flags,
            [name]: SimpleFeatureFlag.fromRecord({
              ...state.flags[name].toRecord(),
              enabled: value,
              modified: true,
            }),
          };

          // Keep the upload confirmation in sync with equipment tracking as
          // long as the user did not explicitly configure it.
          if (name === FeatureFlagName.Equipment) {
            const confirmation = state.flags[
              FeatureFlagName.EquipmentUploadConfirmation
            ];
            if (!confirmation.modified) {
              flags[FeatureFlagName.EquipmentUploadConfirmation] =
                SimpleFeatureFlag.fromRecord({
                  ...confirmation.toRecord(),
                  enabled: value,
                });
            }
          }

          return { flags };
        }),
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
