import { Box, CssBaseline, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
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
            width: 4 / 5,
            flex: '0 1 auto',
            justifyItems: 'center',
            zIndex: 1,

            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h2" sx={{ zIndex: 1 }}>
            Overrides
          </Typography>
          <Box
            sx={{
              flex: '0 1 auto',
              justifyItems: 'center',
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

        <Box
          sx={{
            width: 4 / 5,
            flex: '0 1 auto',
            justifyItems: 'center',
            zIndex: 1,
          }}
        >
          <Typography variant="h2" sx={{ zIndex: 1 }}>
            Multipliers
          </Typography>
          <MultiplierSettings />
        </Box>
      </Box>
    </>
  );
};
