import { Theme } from '@mui/material/styles';

export interface CustomThemeConfig {
  name: string; // Short identifier, e.g. 'ocean'
  longName: string; // Descriptive name, e.g. 'Ocean Breeze'
  backgrounds: string[];
  // Optional overrides – if provided these will be used instead of Vibrant extraction.
  primary?: string;
  secondary?: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    vibrant: {
      main: string;
      light: string;
      dark: string;
    };
    muted: {
      main: string;
      light: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    vibrant?: {
      main: string;
      light: string;
      dark: string;
    };
    muted?: {
      main: string;
      light: string;
      dark: string;
    };
  }
  interface Theme {
    custom: {
      backgroundImage: string;
      themeName: string;
      longName: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      backgroundImage?: string;
      themeName?: string;
      longName?: string;
    };
  }
}

// Export an interface for our custom theme
export interface CustomTheme extends Theme {
  palette: Theme['palette'] & {
    vibrant: {
      main: string;
      light: string;
      dark: string;
    };
    muted: {
      main: string;
      light: string;
      dark: string;
    };
  };
  custom: {
    backgroundImage: string;
    themeName: string;
    longName: string;
  };
}
