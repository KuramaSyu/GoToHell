import { create } from 'zustand';
import { defaultPreferences, UserPreferences } from '../models/Preferences';
import { setCookie } from '../utils/cookies';

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
  preferencesLoaded: boolean;
}

const usePreferenceStore = create<PreferencesState>((set) => ({
  preferences: defaultPreferences(),
  preferencesLoaded: false,
  setPreferences: (preferences) => {
    set({ preferences: preferences, preferencesLoaded: true });
    setCookie('preferences', JSON.stringify(preferences), 9999);
  },
}));

export default usePreferenceStore;
