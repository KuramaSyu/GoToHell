import { create } from 'zustand';
import { UserPreferences } from '../models/Preferences';

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
}

const usePreferenceStore = create<PreferencesState>((set) => ({
  preferences: {
    game_overrides: [],
    multipliers: [],
  },
  setPreferences: (preferences) => set({ preferences: preferences }),
}));

export default usePreferenceStore;
