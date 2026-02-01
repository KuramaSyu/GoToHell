import { Box, CssBaseline, Input, OutlinedInput, Slider } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { getCookie, setCookie } from '../../utils/cookies';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { Multiplier, UserPreferences } from '../../models/Preferences';
import { GenerateMarks } from '../../utils/Marks';
import { MultiplierSlieder, SettingsSlider } from './Sliders';
import { useThemeStore } from '../../zustand/useThemeStore';

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const [sliderValue, setSliderValue] = React.useState<number | null>(1);
  const { theme } = useThemeStore();
  var multipliers: Multiplier[] = [];
  const GAME = null; // null means global

  // load multiplier value from perferences
  useEffect(() => {
    // find global multiplier
    multipliers = preferences.multipliers;
    const globalMultiplier = multipliers.find(
      (multiplier) => multiplier.game == GAME,
    );

    // set the value of this multiplier for the slider
    if (globalMultiplier) {
      setSliderValue(globalMultiplier.multiplier);
    }
  }, []);

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
        max={4}
        saveValue={saveMultiplier}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
      ></MultiplierSlieder>
    </Box>
  );
};
