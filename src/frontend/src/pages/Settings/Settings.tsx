import { Box, CssBaseline } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { getCookie } from '../../utils/cookies';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  var multipliers = [];
  // iterate andcreate flex colums
  return <Box sx={{ display: 'flex', flexDirection: 'row' }}></Box>;
};

export const Settings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();

  useEffect(() => {
    // read preferences on page load
    const value = getCookie('preferences');
    if (value != null) {
      setPreferences(JSON.parse(value));
    }
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
        <MultiplierSettings />
      </Box>
    </>
  );
};
