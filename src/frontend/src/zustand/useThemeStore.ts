import { create } from 'zustand';
import { createTheme } from '@mui/material/styles';
import { ThemeManager } from '../theme/themeManager';
import {
  CustomTheme,
  CustomThemeConfig,
  CustomThemeImpl,
} from '../theme/customTheme';
import customThemeData from '../theme/themes.json';
import usePreferenceStore from './PreferenceStore';
import { loadPreferencesFromCookie } from '../utils/cookiePreferences';
import { defaultTheme } from './defaultTheme';
import useAppBackgroundStore from './AppBackgroundStore';

export const docsTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5E81AC', light: '#81A1C1', dark: '#4C688A' }, // Nord10, Nord9
    secondary: { main: '#B48EAD', light: '#D8DEE9', dark: '#3B4252' }, // Nord15
    vibrant: { main: '#88C0D0', light: '#8FBCBB', dark: '#5E81AC' }, // Nord8, Nord7
    muted: { main: '#eceff4', light: '#616E88', dark: '#3B4252' }, // Nord3, Nord1
    background: {
      default: '#eceff4', // Nord0
      paper: '#3B4252', // Nord1
    },
    warning: { main: '#d08770', light: '#ebcb8b', dark: '#bf616a' }, // Nord14, Nord7, Nord13
    error: { main: '#bf616a', light: '#d08770', dark: '#a54242' }, // Nord13, Nord14, custom dark
    success: { main: '#5e81ac', light: '#8fbcbb', dark: '#4c688a' }, // Nord10, Nord7, Nord9
  },
  custom: {
    backgroundImage: 'https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg',
    themeName: 'docs',
    longName: 'Nord Theme Bright',
  },
}) as CustomTheme;

// Define our available custom themes.
export const customThemes: CustomThemeConfig[] = customThemeData;

export const getThemeNames = () => {
  return customThemes.map((theme) => theme.name);
};

// Instantiate our ThemeManager with the custom configurations.
const themeManager = ThemeManager.getInstance();

interface ThemeState {
  theme: CustomTheme;
  themeName: string;
  themeLongName: string;

  /**
   * setTheme accepts a theme string, asynchronously generates the MUI theme (including Vibrant extraction),
   * and updates the store with the theme and its names.
   * static themes: 'brightNord', 'default'
   */
  setTheme: (themeName: string) => Promise<void>;

  /**
   * initializeTheme picks a random theme from custom themes and sets it.
   * It respects the user's preferences if any are set.
   */
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: defaultTheme,
  themeName: defaultTheme.custom.themeName,
  themeLongName: defaultTheme.custom.longName,

  setTheme: async (themeName: string) => {
    console.log(`set theme to ${themeName}`);
    //set({ themeName: themeName });
    const setThemeStartMs = performance.now();
    const speedMultiplier = useAppBackgroundStore
      .getState()
      .consumeNextChangeSpeedMultiplier();

    console.debug('[Theme] Consumed speed multiplier:', speedMultiplier);
    console.debug('[Theme] Calling ThemeManager.generateTheme(...)');

    const generatedTheme = await themeManager.generateTheme(themeName);

    console.debug(
      '[Theme] ThemeManager.generateTheme(...) resolved in ms:',
      Math.round(performance.now() - setThemeStartMs),
    );

    if (generatedTheme) {
      const previousDurations = { ...generatedTheme.transitions.duration };
      console.debug('[Theme] Original durations:', previousDurations);

      generatedTheme.setDurationMultiplier(speedMultiplier);
      console.debug(
        '[Theme] Scaled durations:',
        generatedTheme.transitions.duration,
      );

      set({
        theme: generatedTheme,
        themeName: generatedTheme.custom.themeName,
        themeLongName: generatedTheme.custom.longName,
      });

      // If we temporarily slowed down the theme transition for a background swap,
      // restore the original duration values afterwards without calling `set(...)`
      // to avoid an additional rerender.
      if (speedMultiplier !== 1) {
        const activeComplexDuration =
          generatedTheme.transitions.duration.complex;
        const resetAfterMs = Math.max(
          1,
          Math.round((2 * activeComplexDuration) / 3) + 32,
        );
        console.debug(
          '[Theme] Scheduling duration reset in ms:',
          resetAfterMs,
          'for theme:',
          generatedTheme.custom.themeName,
        );

        setTimeout(() => {
          const activeTheme = get().theme;
          // Only restore if this is still the currently active theme object.
          if (activeTheme === generatedTheme) {
            activeTheme.setTransitionDurations(previousDurations);

            // Important: publish one store update so components recompute any
            // prebuilt transition strings derived during render.
            const restoredTheme = new CustomThemeImpl(activeTheme);
            set({
              theme: restoredTheme,
              themeName: restoredTheme.custom.themeName,
              themeLongName: restoredTheme.custom.longName,
            });

            console.debug('[Theme] Duration reset applied:', previousDurations);
          } else {
            console.debug(
              '[Theme] Duration reset skipped (active theme changed before reset).',
            );
          }
        }, resetAfterMs);
      }
    } else {
      console.error(`Unable to generate theme for "${themeName}".`);
    }

    console.debug(
      '[Theme] setTheme total duration ms:',
      Math.round(performance.now() - setThemeStartMs),
    );
  },
  initializeTheme: async () => {
    // get preferences from the store
    loadPreferencesFromCookie();
    const preferences = usePreferenceStore.getState().preferences;

    // filter out valid games, or use all if no preferences are set
    var validThemes = customThemes;
    const preferredGames = preferences.ui.displayedGames?.filter(
      (x) => x.isDisplayed,
    );
    if (preferredGames !== null) {
      validThemes = customThemes.filter((theme) =>
        preferredGames!.map((x) => x.name).includes(theme.name),
      );
    }
    const randomTheme =
      validThemes[Math.floor(Math.random() * validThemes.length)];
    // If a theme is found, apply it using "get" provided as the second parameter.
    if (randomTheme) {
      await get().setTheme(randomTheme.name);
    } else {
      console.error('No theme available to initialize.');
    }
    console.log('Theme initialized:', get().themeName, get().themeLongName);
  },
}));
