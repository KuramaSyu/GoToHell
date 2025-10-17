import { createTheme } from '@mui/material/styles';
import { CustomTheme } from '../theme/customTheme';

// Define a Nord-themed default theme as a fallback.
export const defaultTheme = createTheme({
  // https://www.nordtheme.com/
  palette: {
    mode: 'dark',
    primary: { main: '#5E81AC', light: '#81A1C1', dark: '#4C688A' }, // Nord10, Nord9
    secondary: { main: '#b48ead', light: '#D8DEE9', dark: '#3B4252' }, // Nord15
    vibrant: { main: '#b48ead', light: '#ebcb8b', dark: '#bf616a' }, // Nord8, Nord7
    muted: { main: '#434c5e', light: '#4c566a', dark: '#3B4252' }, // Nord1, 2, 3
    text: { primary: '#d8dee9', secondary: '#e5e9f0' },
    background: {
      default: '#2E3440', // Nord0
      paper: '#3B4252', // Nord1
    },
    warning: { main: '#d08770', light: '#ebcb8b', dark: '#bf616a' }, // Nord14, Nord7, Nord13
    error: { main: '#bf616a', light: '#d08770', dark: '#a54242' }, // Nord13, Nord14, custom dark
    success: { main: '#5e81ac', light: '#8fbcbb', dark: '#4c688a' }, // Nord10, Nord7, Nord9
  },
  custom: {
    backgroundImage: 'https://i.postimg.cc/prhxrMh8/thumb-1920-553471.jpg',
    themeName: 'default',
    longName: 'Nord Theme',
  },
}) as CustomTheme;
