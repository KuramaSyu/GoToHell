import { createTheme as muiCreateTheme, ThemeOptions, Theme, PaletteOptions } from "@mui/material/styles";

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
}

// Extend Theme to include CustomPalette
interface CustomTheme extends Theme {
  palette: CustomPalette;
}

// Correctly type the function to return CustomTheme
export default function createTheme(options?: CustomThemeOptions): CustomTheme {
  return muiCreateTheme({
    ...options,
    palette: {
      ...options?.palette,
      background: {
        default: options?.palette?.background?.default || "#ffffff", // Default background color
        paper: options?.palette?.background?.paper || "#f8f9fa", // Default paper color
        ...options?.palette?.background,
        backgroundImage: options?.palette?.background?.backgroundImage || "", // Ensure a default value
      },
    },
  }) as CustomTheme; // Type assertion to fix "never" error
}


export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#007bff" },
    secondary: { main: "#f50057" },
    background: {
      default: "#ffffff",
      paper: "#f8f9fa",
      backgroundImage: "", // Optional: Set URL here
    },
    text: { primary: "#222222", secondary: "#555555" },
  },
});


export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#bb86fc" },
    secondary: { main: "#03dac6" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
      backgroundImage: "https://www.bleepstatic.com/content/hl-images/2022/04/08/GitHub__headpic.jpg",
    },
    text: { primary: "#ffffff", secondary: "#a8a8a8" },
  },
});
export const nordTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#81a1c1" },
    secondary: { main: "#5e81ac" },
    background: {
      default: "#2e3440",
      paper: "#3b4252",
      backgroundImage: "", // Example background image
    },
    text: { primary: "#d8dee9", secondary: "#88c0d0" },
  },
});

export const githubTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0366d6" },
    secondary: { main: "#6f42c1" },
    background: {
      default: "#f6f8fa",
      paper: "#e1e4e8",
      backgroundImage: "", // No image by default
    },
    text: { primary: "#24292e", secondary: "#586069" },
  },
});

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  nord: nordTheme,
  github: githubTheme
}