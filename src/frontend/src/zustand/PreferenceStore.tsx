import { create } from 'zustand';
import { defaultPreferences, UserPreferences } from '../models/Preferences';

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
}

const usePreferenceStore = create<PreferencesState>((set) => ({
  preferences: defaultPreferences(),
  setPreferences: (preferences) => set({ preferences: preferences }),
}));

export default usePreferenceStore;
