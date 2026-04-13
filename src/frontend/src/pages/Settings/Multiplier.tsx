import { Box } from '@mui/material';
import React from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { UserPreferences } from '../../models/Preferences';
import { MultiplierSlieder } from './Sliders';

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const [sliderValue, setSliderValue] = React.useState<number | null>(1);

  const saveMultiplier = (game: string | null, value: number) => {
    var newPreferences: UserPreferences = {
      ...preferences,
      multipliers: [
        {
          game: game, // null means global
          sport: null, // null means all sports
          multiplier: value,
        },
        ...preferences.multipliers.filter(
          (multiplier) =>
            !(multiplier.game === game && multiplier.sport === null),
        ),
      ],
    };

    // clear all game overrides, where the multiplier is 1, since default is 1
    // and this would make the cookie unnecessarily big
    newPreferences = {
      ...newPreferences,
      multipliers: newPreferences.multipliers.filter((v) => v.multiplier !== 1),
    };
    setSliderValue(Number(value));

    setPreferences(newPreferences);
  };

  return (
    <Box>
      <MultiplierSlieder
        min={0}
        max={Math.max(2, sliderValue ?? 1)}
        saveValue={saveMultiplier}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
      ></MultiplierSlieder>
    </Box>
  );
};
