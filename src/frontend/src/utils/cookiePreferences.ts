import { defaultPreferences } from '../models/Preferences';
import usePreferenceStore from '../zustand/PreferenceStore';
import { getCookie } from './cookies';

/**
 * loads the 'preferences' cookie and sets the zustand state to the cookie value or default value
 */
export function loadPreferencesFromCookie() {
  const setPreferences = usePreferenceStore.getState().setPreferences;
  const value = getCookie('preferences');
  if (value != null) {
    const json = JSON.parse(value);
    const preferences = {
      ...defaultPreferences(),
      ...json,
    };
    setPreferences(preferences);
  } else {
    // if the cookie is not set, we set the default preferences
    setPreferences(defaultPreferences());
  }
}
