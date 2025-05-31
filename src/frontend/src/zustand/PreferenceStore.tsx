import { create } from 'zustand';
import { defaultPreferences, UserPreferences } from '../models/Preferences';

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
  preferencesLoaded: boolean;
}

const usePreferenceStore = create<PreferencesState>((set) => ({
  preferences: defaultPreferences(),
  preferencesLoaded: false,
  setPreferences: (preferences) =>
    set({ preferences: preferences, preferencesLoaded: true }),
}));

export default usePreferenceStore;
