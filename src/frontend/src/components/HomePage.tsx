import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

import { useThemeStore } from '../zustand/useThemeStore';
import AppBackground from './AppBackground';
import MainContent from './MainContent';
import { SportsTimeline } from './RecentSports/Timeline';
import { useUsersStore, useUserStore } from '../userStore';
import { loadPreferencesFromCookie } from '../utils/cookiePreferences';
import { UserApi } from '../utils/api/Api';
import { ThemeProvider } from '@emotion/react';

const HomePage: React.FC = () => {
  const { theme } = useThemeStore();
  const [loaded, setLoaded] = useState(false);
  const { addUser } = useUsersStore();
  const { user } = useUserStore();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // initially, load preferences from cookie
  useEffect(() => {
    loadPreferencesFromCookie();
  }, []);

  // add current user to user array
  useEffect(() => {
    if (user != null) {
      addUser(user);
    }
  }, [user]);

  // Check if background image is set, and trigger fade-in effect
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

  useEffect(() => {
    if (user === null) {
      return;
    }
    const fetch = async () => {
      await new UserApi().fetchFriends();
    };
    fetch();
  }, [addUser, user]);

  const TimelineBox = isMobile ? null : (
    <Box
      sx={{
        width: 'clamp(300px, 25%, 420px)',
        height: '100%',
        flex: '0 1 auto',
        overflowY: 'auto', // Ensures the timeline scrolls instead of overflowing
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: '32px',
        backdropFilter: 'blur(15px)',
      }}
    >
      <SportsTimeline />
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%', // Instead of 100vh, it now respects its parent’s height
          overflow: 'hidden', // Prevents overflow
          paddingTop: '6px',
        }}
      >
        <AppBackground></AppBackground>
        {TimelineBox}
        <Box sx={{ flex: '1 1 auto', height: '100%', overflow: 'hidden' }}>
          <MainContent />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
