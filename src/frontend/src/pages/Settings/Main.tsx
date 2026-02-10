import { Box, CssBaseline, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { MultiplierSettings } from './Multiplier';
import { loadPreferencesFromCookie } from '../../utils/cookiePreferences';
import { PlankOverride } from './PlankOverride';
import { SportDragDrop } from './SportDragDrop';
import { GameDragDrop } from './GameDragDrop';
import useUploadStore from '../../zustand/UploadStore';
import { useNavigate } from 'react-router-dom';
import { defaultPreferences } from '../../models/Preferences';
import { BaseMultiplierModifier } from './BaseMultiplierModifier';
import { MultiplierTable } from './MultiplierTable';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { useSwipeable } from 'react-swipeable';
import { Pages } from '../../components/TopBar/TopBar';

const SettingsBoxSX = {
  display: 'flex',
  flexDirection: 'column',
  width: 4 / 5,
  flex: '0 1 auto',
  justifyItems: 'center',
  zIndex: 1,
};

const RoundedBlurBoxSX = {
  backdropFilter: 'blur(25px)',
  borderRadius: 5,
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  backgroundColor: 'rgba(0,0,0,0.2)',
};
export const Settings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedRight: () => navigate(Pages.FRIENDS),
  });
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    // fixes a bug, where random uploads where triggered
    useUploadStore.getState().setUpload(0);

    // load requirements to prevent a not loading page
    new ApiRequirementsBuilder()
      .add(ApiRequirement.User)
      .add(ApiRequirement.Streak)
      .fetchIfNeeded();
  }, []);

  const FullWidthOnMobile = () => {
    return {
      width: isMobile ? '100%' : '4/5',
    };
  };

  // Listen for esc, to navigate to home page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <AppBackground></AppBackground>
      <CssBaseline></CssBaseline>
      <Box
        {...handlers}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'top',
          alignItems: 'center',
          gap: 10,
          overflow: 'scroll',
          pt: 5,
        }}
      >
        {/* Grid with overrides */}

        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4' sx={{ zIndex: 1 }}>
            Overrides
          </Typography>
          <Box sx={RoundedBlurBoxSX}>
            <GameOverrideSettings />
            <GameOverrideList />
          </Box>
        </Box>

        {/* Grid with game multipliers */}
        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4' sx={{ zIndex: 1 }}>
            Multipliers
          </Typography>
          <MultiplierSettings />
        </Box>

        {/* Table with Sport Base Multipliers */}
        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4'>Sport Bases</Typography>
          <Box sx={{ ...RoundedBlurBoxSX, p: 2 }}>
            <MultiplierTable></MultiplierTable>
          </Box>
        </Box>
        {/* Plank Seconds */}
        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4' sx={{ zIndex: 1 }}>
            Plank Settings
          </Typography>
          <Typography variant='subtitle1' sx={{ zIndex: 1 }}>
            How many seconds plank is the maximum, you are able to? Usually 2 -
            4 Minutes
          </Typography>
          <PlankOverride />
        </Box>
        {/* Sport Select */}
        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4' sx={{ zIndex: 1 }}>
            Sport Select
          </Typography>
          <SportDragDrop></SportDragDrop>
        </Box>
        {/* Game Select */}
        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4' sx={{ zIndex: 1 }}>
            Game Select
          </Typography>
          <GameDragDrop></GameDragDrop>
        </Box>
        {/* reset button */}
        <Box sx={{ ...SettingsBoxSX, ...FullWidthOnMobile() }}>
          <Typography variant='h4' sx={{ zIndex: 1 }}>
            Reset Settings
          </Typography>
          <Typography variant='subtitle1' sx={{ zIndex: 1 }}>
            This will reset all your settings to default. You can also do this
            in the settings menu.
          </Typography>
          <button
            onClick={() => {
              setPreferences(defaultPreferences());
            }}
          >
            Reset Settings
          </button>
        </Box>
      </Box>
    </>
  );
};
