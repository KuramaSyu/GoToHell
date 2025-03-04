import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box } from '@mui/material';
import ThemeSwitcher from '../ThemeSwitcher';
import { lightTheme, darkTheme, nordTheme, githubTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import DiscordLogin from './DiscordLogin';
import TopBar from './TopBar';



const HomePage: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();
  const theme = themes[currentTheme];
  const backgroundImage = theme.palette.background.backgroundImage; // Safe access
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (theme.palette.background.backgroundImage == undefined || theme.palette.background.backgroundImage == "" ) {
      setLoaded(false);
    } else {
      setLoaded(true); // Trigger fade-in after component mounts
    }
  }, [currentTheme]);
  
  return (

      <ThemeProvider theme={theme}>
        {backgroundImage ? <Box
        sx={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: theme.palette.background.default,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: backgroundImage ? "blur(10px)" : "none",
          opacity: loaded ? 1 : 0, // Start invisible, then fade in
          transition: "opacity 0.5s ease", // Smooth fade-in effect
          zIndex: 0,
        }}></Box> : null}
        {/* CssBaseline applies the theme's background and text colors */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <CssBaseline />
        <TopBar></TopBar>
        <Container>
          <Box sx={{ py: 4, textAlign: 'center'}}>
            <h1>Material UI Theme Switcher with Zustand</h1>
            <ThemeSwitcher></ThemeSwitcher>
            <p>
              The current theme is <strong>{currentTheme}</strong>.
            </p>
          </Box>
        </Container>
        </Box>
        <p>
          login with Discord
        </p>
      </ThemeProvider>

  );
};

export default HomePage;
