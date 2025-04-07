import { Box, CssBaseline, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { getCookie } from '../../utils/cookies';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { MultiplierSettings } from './Multiplier';
import { loadPreferencesFromCookie } from '../../utils/cookiePreferences';

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
          justifyContent: 'center',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {/* Grid with multipliers */}
        <Box
          sx={{
            width: 4 / 5,
            flex: '0 1 auto',
            justifyItems: 'center',
            zIndex: 1,
          }}
        >
          <Typography variant="h2">Overrides</Typography>
          <GameOverrideSettings />
        </Box>
        <Box
          sx={{
            width: 4 / 5,
            flex: '0 1 auto',
            justifyItems: 'center',
            zIndex: 1,
          }}
        >
          <GameOverrideList />
        </Box>
        {/* Grid with game overrides */}
        <Box
          sx={{
            width: 4 / 5,
            flex: '0 1 auto',
            justifyItems: 'center',
            zIndex: 1,
          }}
        >
          <Typography variant="h2">Multipliers</Typography>
          <MultiplierSettings />
        </Box>
      </Box>
    </>
  );
};
