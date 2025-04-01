import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

import { useThemeStore } from '../zustand/useThemeStore';
import AppBackground from './AppBackground';
import MainContent from './MainContent';
import { SportsTimeline } from './RecentSports/Timeline';
import { LoadFriends } from '../pages/friends/FriendOverview';
import { useUsersStore, useUserStore } from '../userStore';

const HomePage: React.FC = () => {
  const { theme } = useThemeStore();
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
      await LoadFriends(addUser);
    };
    fetch();
  }, [addUser]);

  return (
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
      <Box
        sx={{
          maxWidth: '35%',
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
      <Box sx={{ flex: '1 1 auto', height: '100%', overflow: 'hidden' }}>
        <MainContent />
      </Box>
    </Box>
  );
};

export default HomePage;
