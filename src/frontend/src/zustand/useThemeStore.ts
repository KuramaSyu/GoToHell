import { create } from 'zustand';
import { createTheme } from '@mui/material/styles';
import { ThemeManager } from '../theme/themeManager';
import { CustomTheme, CustomThemeConfig } from '../theme/customTheme';


// Define a default theme as a fallback.
const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2', light: '#63a4ff', dark: '#004ba0' },
    secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
    vibrant: { main: '#1976d2', light: '#63a4ff', dark: '#004ba0' },
    muted: { main: '#757575', light: '#a4a4a4', dark: '#494949' },
  },
  custom: {
    backgroundImage: 'https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg',
    themeName: 'default',
    longName: 'Default Theme',
  },
}) as CustomTheme;

// Define our available custom themes.
export const customThemes: CustomThemeConfig[] = [
  {
    name: 'league',
    longName: 'League of Legends',
    backgrounds: [
      'https://i.postimg.cc/pXb4tvd8/zeri-lol-moon-snow-art-hd-wallpaper-uhdpaper-com-522-5-c.jpg',
    ],
  },
  {
    name: 'overwatch',
    longName: 'Overwatch',
    backgrounds: ['https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg'],
  },
  {
    name: 'tft',
    longName: 'Teamfight Tactics',
    backgrounds: [
      'https://i.postimg.cc/cCc5PpJN/wp7407642-little-legends-wallpapers.jpg',
      'https://i.postimg.cc/k4kdHDQk/teamfight-tactics-galaxies-penguin-featherknight-uhdpaper-com-4-K-7-1270.jpg',
    ],
  },
  {
    name: 'repo',
    longName: 'R.E.P.O',
    backgrounds: [
      'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3241660/ss_a66715d57329c456d91aeb11fbd406e7d8c5dbc7.1920x1080.jpg?t=1740578354',
    ],
  },
];

export const getThemeNames = () => {
  return customThemes.map((theme) => theme.name);
};

// Instantiate our ThemeManager with the custom configurations.
const themeManager = new ThemeManager(customThemes);

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
    // Pick a random theme from customThemes.
    const randomTheme =
      customThemes[Math.floor(Math.random() * customThemes.length)];
    // Use "get" provided as the second parameter.
    await get().setTheme(randomTheme.name);
  },
}));

// Immediately trigger initialization so that the default theme is replaced.
useThemeStore
  .getState()
  .initializeTheme()
  .catch((err) => console.error(err));
