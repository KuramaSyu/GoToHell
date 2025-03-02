// themes.ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#007bff' },
    secondary: { main: '#f50057' },
    background: { default: '#ffffff', paper: '#f8f9fa' },
    text: { primary: '#222222', secondary: '#555555' },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    secondary: { main: '#03dac6' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#a8a8a8' },
  },
});

export const nordTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#81a1c1' },
    secondary: { main: '#5e81ac' },
    background: { default: '#2e3440', paper: '#3b4252' },
    text: { primary: '#d8dee9', secondary: '#88c0d0' },
  },
});

export const githubTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0366d6' },
    secondary: { main: '#6f42c1' },
    background: { default: '#f6f8fa', paper: '#e1e4e8' },
    text: { primary: '#24292e', secondary: '#586069' },
  },
});

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  nord: nordTheme,
  github: githubTheme,
};
