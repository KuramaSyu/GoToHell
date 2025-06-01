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
import { defaultPreferences, savePreferences } from '../../models/Preferences';
import { BaseMultiplierModifier } from './BaseMultiplierModifier';

const SettingsBoxSX = {
  display: 'flex',
  flexDirection: 'column',
  width: 4 / 5,
  flex: '0 1 auto',
  justifyItems: 'center',
  zIndex: 1,
};
export const Settings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const navigate = useNavigate();

  useEffect(() => {
    const { setUpload } = useUploadStore.getState();
    setUpload(0);
  }, []);

  // done in theme store
  // useEffect(() => {
  //   // read preferences on page load
  //   loadPreferencesFromCookie();
  // }, []);

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

        <Box sx={SettingsBoxSX}>
          <Typography variant="h4" sx={{ zIndex: 1 }}>
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
          <Typography variant="h4" sx={{ zIndex: 1 }}>
            Multipliers
          </Typography>
          <MultiplierSettings />
        </Box>

        {/* Table with Sport Base Multipliers */}
        <BaseMultiplierModifier></BaseMultiplierModifier>
        {/* Plank Seconds */}
        <Box sx={SettingsBoxSX}>
          <Typography variant="h4" sx={{ zIndex: 1 }}>
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
          <Typography variant="h4" sx={{ zIndex: 1 }}>
            Sport Select
          </Typography>
          <SportDragDrop></SportDragDrop>
        </Box>
        {/* Game Select */}
        <Box sx={SettingsBoxSX}>
          <Typography variant="h4" sx={{ zIndex: 1 }}>
            Game Select
          </Typography>
          <GameDragDrop></GameDragDrop>
        </Box>
        {/* reset button */}
        <Box sx={{ mb: 5, ...SettingsBoxSX }}>
          <Typography variant="h4" sx={{ zIndex: 1 }}>
            Reset Settings
          </Typography>
          <Typography variant="subtitle1" sx={{ zIndex: 1 }}>
            This will reset all your settings to default. You can also do this
            in the settings menu.
          </Typography>
          <button
            onClick={() => {
              savePreferences(defaultPreferences());
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
