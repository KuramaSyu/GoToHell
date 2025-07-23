import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';
import { ThemeProvider } from '@emotion/react';

interface AppBackgroundProps {
  theme: any;
}

const AppBackground: React.FC = () => {
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

  if (!backgroundImage) return null;

  return (
    <Box>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </Box>
  );
};

export default AppBackground;
