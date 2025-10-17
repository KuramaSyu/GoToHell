import { useEffect, useState } from 'react';
import { useUserStore } from '../../userStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { Box, Typography } from '@mui/material';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { StaticCircleBackground } from '../LoadingPage/CircleBackground';
import { DiscordLoginBig } from './DiscordLoginBig';
import { Title } from '../LoadingPage/Title';
import React from 'react';
import { LogoSvgComponent } from '../LoadingPage/Main';
import { useMinSquareSize } from '../LoadingPage/minSquareSize';
import { defaultTheme } from '../../zustand/defaultTheme';

export const LoginPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [oldTheme, setOldTheme] = useState<string | null>();
  const { user } = useUserStore();
  const { isMobile } = useBreakpoint();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const size = useMinSquareSize(containerRef);

  useEffect(() => {
    if (theme.custom.themeName !== 'default') {
      setOldTheme(theme.custom.themeName);
      setTheme('default');
    }
    return;
  }, [theme]);

  useEffect(() => {
    if (oldTheme === null || oldTheme === undefined) return;
    return () => {
      console.log('set old theme');
      setTheme(oldTheme);
    };
  }, [oldTheme]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.paper,
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <StaticCircleBackground
          color={theme.palette.background.default}
          atXPercent={isMobile ? 50 : -40}
          atYPercent={isMobile ? 140 : 50}
          sizePercent={100}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : 2 / 5,
          height: isMobile ? 2 / 5 : '100%',
          zIndex: 'inherit',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <DiscordLoginBig></DiscordLoginBig>
      </Box>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : 3 / 5,
          height: isMobile ? 3 / 5 : '100%',
          justifyContent: isMobile ? 'space-between' : 'center',
          pb: isMobile ? 6 : 0,
          alignItems: 'center',
          zIndex: 0,
        }}
      >
        <Box sx={{ fontSize: isMobile ? '4rem' : '10vh' }}>
          <Title theme={defaultTheme} />
        </Box>
        <Box
          sx={{
            width: (size * 2) / 3,
            height: (size * 2) / 3,
            display: 'flex',
            zIndex: 5,
          }}
        >
          <LogoSvgComponent />
        </Box>
      </Box>
    </Box>
  );
};
