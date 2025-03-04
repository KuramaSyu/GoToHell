import React from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box } from '@mui/material';
import ThemeSwitcher from '../ThemeSwitcher';
import { lightTheme, darkTheme, nordTheme, githubTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import DiscordLogin from './DiscordLogin';
import TopBar from './TopBar';



const HomePage: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <ThemeProvider theme={themes[currentTheme]}>
      {/* CssBaseline applies the theme's background and text colors */}
      <CssBaseline />
      <TopBar></TopBar>
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <h1>Material UI Theme Switcher with Zustand</h1>
          <ThemeSwitcher></ThemeSwitcher>
          <p>
            The current theme is <strong>{currentTheme}</strong>.
          </p>
        </Box>
      </Container>
      <p>
        login with Discord
      </p>
    </ThemeProvider>
  );
};

export default HomePage;
