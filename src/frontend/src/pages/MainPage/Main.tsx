import React, { useEffect, useState } from 'react';
import { Box, Fade, useMediaQuery, useTheme } from '@mui/material';

import { useThemeStore } from '../../zustand/useThemeStore';
import AppBackground from '../../components/AppBackground';
import MainContent from './MainContent';
import { SportsTimeline } from './RecentSports/Timeline';
import { useUsersStore, useUserStore } from '../../userStore';
import { loadPreferencesFromCookie } from '../../utils/cookiePreferences';
import { UserApi } from '../../utils/api/Api';
import { ThemeProvider } from '@emotion/react';
import { QuickActionMenu } from './QuickActions/Main';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { StreakTimeline } from './RecentSports/StreakTimeline';
import { TimelineWrapper } from './RecentSports/TimelineWrapper';
import { LoadingPage } from '../LoadingPage/Main';
import { useLoadingStore } from '../../zustand/loadingStore';
import { AnimatePresence, motion } from 'framer-motion';
import { s } from 'framer-motion/dist/types.d-6pKw1mTI';

const MainPage: React.FC = () => {
  const { theme } = useThemeStore();
  const { isLoading } = useLoadingStore();
  const { addUser } = useUsersStore();
  const { user } = useUserStore();
  const { isMobile } = useBreakpoint();
  const [exitPercentage, setExitPercentage] = useState(
    Math.round(Math.random() * 100)
  );
  const oneOrZero = Math.round(exitPercentage / 100) * 100;
  const spring = {
    type: 'spring',
    damping: 8,
    stiffness: 30,
  };

  useEffect(() => {
    (async () => {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.Friends)
        .add(ApiRequirement.Preferences)
        .fetchIfNeeded();
    })();
  }, []);
  // add current user to user array
  useEffect(() => {
    if (user != null) {
      addUser(user);
    }
  }, [user]);

  const TimelineBox =
    isMobile || isLoading ? null : (
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
        <TimelineWrapper />
      </Box>
    );

  return (
    <ThemeProvider theme={theme}>
      <AnimatePresence initial={false}>
        {isLoading && (
          <motion.div
            initial={false}
            animate={{ clipPath: 'circle(100% at 50% 50%)' }}
            exit={{
              clipPath: oneOrZero
                ? `circle(0% at 100% ${exitPercentage}%)`
                : `circle(0% at ${exitPercentage}% 100%)`,
              opacity: 0.2,
            }}
            transition={spring}
            style={{
              position: 'fixed',
              zIndex: 9999,
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
            }}
          >
            <LoadingPage></LoadingPage>
          </motion.div>
        )}
      </AnimatePresence>
      <QuickActionMenu></QuickActionMenu>
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
          {!isLoading && <MainContent />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainPage;
