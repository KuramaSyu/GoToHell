import '@mui/material/styles';

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
