import { Box, CssBaseline, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { MultiplierSettings } from './Multiplier';
import { loadPreferencesFromCookie } from '../../utils/cookiePreferences';
import { PlankOverride } from './PlankOverride';
import { SportDragDrop } from './SportDragDrop';

const SettingsBoxSX = {
  width: 4 / 5,
  flex: '0 1 auto',
  justifyItems: 'center',
  zIndex: 1,
};
export const Settings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();

  useEffect(() => {
    // read preferences on page load
    loadPreferencesFromCookie();
  }, []);

  return (
    <>
      <AppBackground></AppBackground>
      <CssBaseline></CssBaseline>
      <Box
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            ...SettingsBoxSX,
          }}
        >
          <Typography variant="h2" sx={{ zIndex: 1 }}>
            Overrides
          </Typography>
          <Box
            sx={{
              backdropFilter: 'blur(25px)',
              borderRadius: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <GameOverrideSettings />
            <GameOverrideList />
          </Box>
        </Box>

        {/* Grid with game multipliers */}

        <Box sx={SettingsBoxSX}>
          <Typography variant="h2" sx={{ zIndex: 1 }}>
            Multipliers
          </Typography>
          <MultiplierSettings />
        </Box>

        {/* Plank Seconds */}
        <Box sx={SettingsBoxSX}>
          <Typography variant="h2" sx={{ zIndex: 1 }}>
            Plank Settings
          </Typography>
          <Typography variant="subtitle1" sx={{ zIndex: 1 }}>
            How many seconds plank is the maximum, you are able to? Usually 2 -
            4 Minutes
          </Typography>
          <PlankOverride />
        </Box>
        {/* Sport Select */}
        <Box sx={SettingsBoxSX}>
          <Typography variant="h2" sx={{ zIndex: 1 }}>
            Sport Select
          </Typography>
          <SportDragDrop></SportDragDrop>
        </Box>
      </Box>
    </>
  );
};
