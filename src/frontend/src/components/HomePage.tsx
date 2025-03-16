import React, { useEffect, useState } from 'react';
import { ThemeProvider, Box } from '@mui/material';

import { useThemeStore } from '../zustand/useThemeStore';
import TopBar from './TopBar';
import { GameSelector, AmountDisplay } from './GameSelect';
import { DeathSlider } from './NumberSlider';
import { UploadScore } from './UploadScore';
import ErrorDisplay from './ErrorDisplay';
import { TotalScoreDisplay } from './TotalScoreDisplay';
import { SportSelector } from './SportSelect';

const HomePage: React.FC = () => {
  const { theme } = useThemeStore();
  const backgroundImage = theme.custom.backgroundImage; // Safe access
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (
      theme.custom.backgroundImage == undefined ||
      theme.custom.backgroundImage == ''
    ) {
      setLoaded(false);
    } else {
      setLoaded(true); // Trigger fade-in after component mounts
    }
  }, [theme]);

  return (
    <Box width={'100vw'}>
      <ThemeProvider theme={theme!}>
        {backgroundImage ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: theme.palette.background.default,
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: backgroundImage ? 'blur(9px)' : 'none',
              opacity: loaded ? 1 : 0, // Start invisible, then fade in
              transition: 'opacity 0.5s ease', // Smooth fade-in effect
              zIndex: 0,
              display: 'flex',
              flexDirection: 'row',
            }}
          ></Box>
        ) : null}
        <TopBar />
        <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-evenly',
        minHeight: 0, // allow children to fill height
      }}
        >
       {/* top row */}
       <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          px: 10,
        }}
      >

        <Box sx={{ display: 'flex' }}>
          <TotalScoreDisplay />
        </Box>

        <Box sx={{ display: 'flex' }}>
          <AmountDisplay />
        </Box>

      </Box>

      {/* box for middle row */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-around',
          p: 2,
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            maxWidth: 1 / 3,
            height: '100%',
            minHeight: 0,
          }}
        >
          <GameSelector />
        </Box>

        <Box
          sx={{
            width: 1 / 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DeathSlider />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <UploadScore />
          </Box>
        </Box>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <SportSelector />
        </Box>
      </Box>
    </Box>
    <ErrorDisplay />
  </ThemeProvider>
</Box>
  );
};

export default HomePage;
