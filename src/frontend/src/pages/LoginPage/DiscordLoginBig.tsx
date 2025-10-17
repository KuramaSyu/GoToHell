import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Button,
  Box,
  Avatar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useUserStore } from '../../userStore';
import { BACKEND_BASE } from '../../statics';
import LogoutIcon from '@mui/icons-material/Logout';
import { SportScore } from '../../models/Sport';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { UserApi } from '../../utils/api/Api';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ApiRequirementsBuilder } from '../../utils/api/ApiRequirementsBuilder';
import { defaultTheme } from '../../zustand/defaultTheme';

export const DiscordLoginBig: React.FC = () => {
  const { user, setUser } = useUserStore();
  const theme = defaultTheme;
  const { isMobile } = useBreakpoint();

  const handleLogin = (): void => {
    window.location.href = `${BACKEND_BASE}/api/auth/discord`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        sx={{
          width: 'auto',
          height: 'auto',
          fontSize: isMobile ? '1rem' : '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: theme.palette.text.primary,
          gap: 2,
          borderRadius: '50px',

          px: '40px',
        }}
        startIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 127.14 96.36"
            width="clamp(40px, 5vw, 60px)"
            height="clamp(40px, 5vw, 60px)"
          >
            <path
              d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83A72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36A77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19A77,77,0,0,0,90.85,96.36A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
              fill={theme.palette.text.primary}
            />
          </svg>
        }
      >
        <Box sx={{ my: 2 }}>Login with Discord</Box>
      </Button>
    </ThemeProvider>
  );
};
