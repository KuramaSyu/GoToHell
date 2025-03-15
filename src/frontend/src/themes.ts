import {
  createTheme as muiCreateTheme,
  ThemeOptions,
  Theme,
  PaletteOptions,
} from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';

// Extend the PaletteOptions to include `backgroundImage`
interface CustomPaletteBackground {
  default: string;
  paper: string;
  backgroundImage?: string; // Optional background image
}

// Extend PaletteOptions
interface CustomPalette extends PaletteOptions {
  background: CustomPaletteBackground;
}

// Extend ThemeOptions to accept CustomPalette
interface CustomThemeOptions extends ThemeOptions {
  palette: CustomPalette;
  typography?: TypographyOptions;
}

// Extend Theme to include CustomPalette
interface CustomTheme extends Theme {
  palette: CustomPalette;
  typography: TypographyOptions;
}

// Correctly type the function to return CustomTheme
export default function createTheme(options?: CustomThemeOptions): CustomTheme {
  const baseTheme: CustomTheme = {
    ...options,
    palette: {
      ...options?.palette,
      background: {
        default: options?.palette?.background?.default || '#ffffff', // Default background color
        paper: options?.palette?.background?.paper || '#f8f9fa', // Default paper color
        ...options?.palette?.background,
        backgroundImage: options?.palette?.background?.backgroundImage || '', // Ensure a default value
      },
    },
    typography: {
      fontFamily: options?.typography?.fontFamily || "'Arial', sans-serif", // Default font
      ...options?.typography, // Merge user typography options
    },
  };
  return muiCreateTheme(baseTheme) as CustomTheme;
}

export const leagueTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1A78AE' }, // LoL Blue
    secondary: { main: '#C89B3C' }, // LoL Gold
    background: {
      default: '#0A0A0F', // Dark Rift-like background
      paper: '#11111A', // Slightly lighter dark mode
      backgroundImage:
        'https://i.postimg.cc/pXb4tvd8/zeri-lol-moon-snow-art-hd-wallpaper-uhdpaper-com-522-5-c.jpg',
    },
    text: { primary: '#EAEAEA', secondary: '#A0A0A0' },
  },
  typography: {
    fontFamily: "'Beaufort for LoL', 'Arial', sans-serif",
  },
});

export const overwatchTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FE8222' }, // Overwatch Red tone
    secondary: { main: '#FACE59' }, // Overwatch Gold tone
    background: {
      default: '#212226', // Dark background reminiscent of Overwatch’s futuristic feel
      paper: '#212226', // A slightly lighter tone for card surfaces
      backgroundImage: 'https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg',
    },
    text: { primary: '#EDEBEB', secondary: '#EDEBEB' },
  },
  typography: {
    fontFamily: "'OverwatchFont', 'Arial', sans-serif", // Use a game-appropriate font if available
  },
});

export const tftTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f4b942' },
    secondary: { main: '#eb485a' },
    background: {
      default: '#481162',
      paper: '#591435',
      backgroundImage:
        'https://i.postimg.cc/cCc5PpJN/wp7407642-little-legends-wallpapers.jpg',
      //'https://i.postimg.cc/k4kdHDQk/teamfight-tactics-galaxies-penguin-featherknight-uhdpaper-com-4-K-7-1270.jpg',
    },
    text: { primary: '#EDEBEB', secondary: '#EDEBEB' },
  },
  typography: {
    fontFamily: "'OverwatchFont', 'Arial', sans-serif", // Use a game-appropriate font if available
  },
});

// these will be available
export const themes = {
  league: leagueTheme,
  overwatch: overwatchTheme,
  tft: tftTheme,
};

// convert themes keys to strings
export const GetValidGames = () => {
  return Object.keys(themes);
};

// map for which is shown next to the score
export const GameSelectionMap = new Map();
GameSelectionMap.set('pushup', 'Push-Ups');
GameSelectionMap.set('plank', 'Seconds Plank');

export function getTheme(themeName: string): CustomTheme {
  return themes[themeName as keyof typeof themes] || themes.league;
}
