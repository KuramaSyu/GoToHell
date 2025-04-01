import { Box, Grid2 as Grid } from '@mui/material';
import React, { useState } from 'react';
import { UserPreferences } from './PreferencesInterface';

export const MultiplierSettings: React.FC = () => {
  return <Box sx={{ display: 'flex', flexDirection: 'row' }}></Box>;
};

export const GameOverrideSettings: React.FC = () => {
  return null;
};
export const Settings: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    game_overrides: [],
    multipliers: [],
  });

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setPreferences({
      ...preferences,
      [name as string]: value,
    });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      test
      {/* Grid with multipliers */}
      <MultiplierSettings />
      {/* Grid with game overrides */}
      <GameOverrideSettings />
    </Box>
  );
};
