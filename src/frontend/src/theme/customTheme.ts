import { Theme } from "@mui/material/styles";
import { Palette } from "@mui/material/styles/createPalette";

export interface CustomTheme extends Theme {
  palette: Palette & {
  //palette: Theme['palette'] & {
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

export interface CustomThemeConfig {
  name: string; // Short identifier, e.g. 'ocean'
  longName: string; // Descriptive name, e.g. 'Ocean Breeze'
  backgrounds: string[];
  // Optional overrides – if provided these will be used instead of Vibrant extraction.
  primary?: string;
  secondary?: string;
}