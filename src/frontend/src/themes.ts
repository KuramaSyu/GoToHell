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

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    secondary: { main: '#03dac6' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      backgroundImage:
        'https://www.bleepstatic.com/content/hl-images/2022/04/08/GitHub__headpic.jpg',
    },
    text: { primary: '#ffffff', secondary: '#a8a8a8' },
  },
});
export const nordTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#81a1c1' },
    secondary: { main: '#5e81ac' },
    background: {
      default: '#2e3440',
      paper: '#3b4252',
      backgroundImage: '', // Example background image
    },
    text: { primary: '#d8dee9', secondary: '#88c0d0' },
  },
});

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

export const themes = {
  dark: darkTheme,
  nord: nordTheme,
  league: leagueTheme,
  overwatch: overwatchTheme,
};

export function getTheme(themeName: string): CustomTheme {
  return themes[themeName as keyof typeof themes] || themes.dark;
}
