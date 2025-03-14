import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box } from '@mui/material';
import ThemeSwitcher from '../ThemeSwitcher';
import { darkTheme, nordTheme, themes, getTheme } from '../themes';
import { useThemeStore } from '../useThemeStore';
import DiscordLogin from './DiscordLogin';
import TopBar from './TopBar';
import GameSelector, { AmountDisplay, GameStatsSelector } from './GameSelect';
import { SportSelector } from './SportSelect';
import { UploadScore } from './UploadScore';
import ErrorDisplay from './ErrorDisplay';
import { TotalScoreDisplay } from './TotalScoreDisplay';



const HomePage: React.FC = () => {
  const { currentTheme, setTheme } = useThemeStore();
  const theme = getTheme(currentTheme);
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
      <Box width={"100vw"}>
      <ThemeProvider theme={theme}>
        {backgroundImage ? <Box
        sx={{
          width: "100%",
          height: "100%",
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
          display: "flex",
          flexDirection: "row"
        }}></Box> : null}
        {/* CssBaseline applies the theme's background and text colors */}
        <TopBar />
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Box sx={{              
              position: 'relative', 
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              justifyItems: "center",
              px: 5,
              mt: 5,
              mu: 2,}}>
            <Box sx={{display: 'flex'}}> <TotalScoreDisplay/> </Box>
            <Box sx={{display: 'flex'}}><AmountDisplay/> </Box>
          </Box>
          <Box sx={{ 
            position: 'relative', 
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-around",
            p: 2
          }}
          >
            <Box sx={{ display: "flex"}}>
              <GameSelector />
            </Box>

            <Box sx={{ width: 1/3, display: "flex", flexDirection: "column"}}>
              <SportSelector />
              <GameStatsSelector></GameStatsSelector>
            </Box>

          </Box>
          <Box sx={{display: 'flex', justifyContent: 'center'}}><UploadScore /></Box>
        </Box>
        <ErrorDisplay />
      </ThemeProvider></Box>

  );
};

export default HomePage;
