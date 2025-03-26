import React, { useEffect, useState } from 'react';
import { ThemeProvider, Box, Toolbar } from '@mui/material';

import { useThemeStore } from '../zustand/useThemeStore';
import TopBar from './TopBar';
import { GameSelector, AmountDisplay } from './GameSelect';
import { NumberSlider } from './NumberSlider';
import { UploadScore } from './UploadScore';
import ErrorDisplay from './ErrorDisplay';
import { TotalScoreDisplay } from './TotalScoreDisplay';
import { SportSelector } from './SportSelect';
import { RecentSports } from './RecentSports/TabView';
import AppBackground from './AppBackground';
import MainContent from './MainContent';
import { HorizontalSportsTimeline } from './RecentSports/Timeline';
import { LoadUsers } from '../friends/FriendOverview';
import { useUsersStore, useUserStore } from '../userStore';

const HomePage: React.FC = () => {
  const { theme } = useThemeStore();
  const backgroundImage = theme.custom.backgroundImage; // Safe access
  const [loaded, setLoaded] = useState(false);
  const { addUser } = useUsersStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user != null) {
      addUser(user);
    }
  }, [user]);
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
    const fetch = async () => {
      await LoadUsers(addUser);
    };
    fetch();
  }, [addUser]);

  return (
    <Box width={'100vw'}>
      <ThemeProvider theme={theme}>
        <Box sx={{ height: '35px' }}></Box> {/* Spacer */}
        <AppBackground></AppBackground>
        {/* Timeline wrapper */}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Box sx={{ maxWidth: '25%', height: '90vh', flex: '0 1 auto' }}>
            <HorizontalSportsTimeline></HorizontalSportsTimeline>
          </Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <MainContent></MainContent>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  );
};

export default HomePage;
