import {
  defaultPreferences,
  UserPreferences,
  UserPreferencesSchema,
} from '../models/Preferences';
import useInfoStore, { SnackbarUpdateImpl } from '../zustand/InfoStore';
import usePreferenceStore from '../zustand/PreferenceStore';
import { getCookie } from './cookies';

/**
 * loads the 'preferences' cookie and sets the zustand state to the cookie value or default value
 */
export function loadPreferencesFromCookie() {
  const setPreferences = usePreferenceStore.getState().setPreferences;
  const value = getCookie('preferences');
  if (value != null) {
    var currentPreferences: UserPreferences = {} as UserPreferences;
    try {
      currentPreferences = UserPreferencesSchema.parse(JSON.parse(value)); // throws if not matching
    } catch (e) {
      console.error('Failed to parse preferences from cookie:', e);
      useInfoStore
        .getState()
        .setMessage(
          new SnackbarUpdateImpl(
            'Failed to load settings. Using defaults.',
            'warning'
          )
        );
    }
    const preferences = {
      ...defaultPreferences(),
      ...currentPreferences,
    };
    setPreferences(preferences);
  } else {
    // if the cookie is not set, we set the default preferences
    setPreferences(defaultPreferences());
  }
}
