import { create } from 'zustand';
import { createTheme } from '@mui/material/styles';
import { ThemeManager } from '../theme/themeManager';
import { CustomTheme, CustomThemeConfig } from '../theme/customTheme';
import customThemeData from '../theme/themes.json';
import usePreferenceStore from './PreferenceStore';
import { loadPreferencesFromCookie } from '../utils/cookiePreferences';

// Define a Nord-themed default theme as a fallback.
export const defaultTheme = createTheme({
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

export const brightNordTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A3BE8C', // Nord14 – bright green :contentReference[oaicite:1]{index=1}
      light: '#ECEFF4', // Nord6 – off-white :contentReference[oaicite:2]{index=2}
      dark: '#8FBCBB', // Nord7 – teal :contentReference[oaicite:3]{index=3}
    },
    secondary: {
      main: '#EBCB8B', // Nord13 – warm yellow :contentReference[oaicite:4]{index=4}
      light: '#E5E9F0', // Nord5 – very light grey :contentReference[oaicite:5]{index=5}
      dark: '#D08770', // Nord12 – muted orange :contentReference[oaicite:6]{index=6}
    },
    vibrant: {
      main: '#88C0D0', // Nord8 – sky blue :contentReference[oaicite:7]{index=7}
      light: '#ECEFF4', // Nord6 – off-white :contentReference[oaicite:8]{index=8}
      dark: '#5E81AC', // Nord10 – bay blue :contentReference[oaicite:9]{index=9}
    },
    muted: {
      main: '#ECEFF4', // Nord6 – off-white :contentReference[oaicite:10]{index=10}
      light: '#E5E9F0', // Nord5 – very light grey :contentReference[oaicite:11]{index=11}
      dark: '#D8DEE9', // Nord4 – light grey :contentReference[oaicite:12]{index=12}
    },
    background: {
      default: '#ECEFF4', // Nord6 – off-white :contentReference[oaicite:13]{index=13}
      paper: '#E5E9F0', // Nord5 – very light grey :contentReference[oaicite:14]{index=14}
    },
    text: {
      primary: '#2E3440', // Nord0 – dark slate :contentReference[oaicite:15]{index=15}
      secondary: '#4C566A', // Nord3 – greyish blue :contentReference[oaicite:16]{index=16}
    },
  },
  custom: {
    backgroundImage: 'https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg',
    themeName: 'brightNord',
    longName: 'Nord Bright Theme',
  },
} as CustomTheme);

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
    loadPreferencesFromCookie();
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
