import { create } from 'zustand';
import { createTheme } from '@mui/material/styles';
import { ThemeManager } from '../theme/themeManager';
import { CustomTheme, CustomThemeConfig } from '../theme/customTheme';
import customThemeData from '../theme/themes.json';
import usePreferenceStore from './PreferenceStore';

// Define a Nord-themed default theme as a fallback.
const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5E81AC', light: '#81A1C1', dark: '#4C688A' }, // Nord10, Nord9
    secondary: { main: '#B48EAD', light: '#D8DEE9', dark: '#3B4252' }, // Nord15
    vibrant: { main: '#88C0D0', light: '#8FBCBB', dark: '#5E81AC' }, // Nord8, Nord7
    muted: { main: '#4C566A', light: '#616E88', dark: '#3B4252' }, // Nord3, Nord1
  },
  custom: {
    backgroundImage: 'https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg',
    themeName: 'default',
    longName: 'Nord Theme',
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
    const generatedTheme = await themeManager.generateTheme(themeName);
    if (generatedTheme) {
      set({
        theme: generatedTheme,
        themeName: generatedTheme.custom.themeName,
        themeLongName: generatedTheme.custom.longName,
      });
    } else {
      console.error(`Unable to generate theme for "${themeName}".`);
    }
  },
  initializeTheme: async () => {
    // get preferences from the store
    const preferences = usePreferenceStore.getState().preferences;

    // filter out valid games, or use all if no preferences are set
    var validThemes = customThemes;
    if (preferences.ui.displayedGames !== null) {
      validThemes = customThemes.filter((theme) =>
        preferences.ui.displayedGames!.includes(theme.name)
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
  },
}));

// Immediately trigger initialization so that the default theme is replaced.
useThemeStore
  .getState()
  .initializeTheme()
  .catch((err) => console.error(err));
