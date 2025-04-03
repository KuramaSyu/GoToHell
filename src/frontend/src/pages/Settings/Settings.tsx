import { Box, Grid2 as Grid } from '@mui/material';
import React, { useState } from 'react';
import { UserPreferences } from '../../models/Preferences';
import usePreferenceStore from '../../zustand/PreferenceStore';

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  var multipliers = [];
  // iterate andcreate flex colums
  return <Box sx={{ display: 'flex', flexDirection: 'row' }}></Box>;
};

export const GameOverrideSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();

  return null;
};
export const Settings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();

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
