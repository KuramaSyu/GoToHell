import { Box, CssBaseline, Input, OutlinedInput, Slider } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { getCookie, setCookie } from '../../utils/cookies';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { Multiplier, UserPreferences } from '../../models/Preferences';
import { GenerateMarks } from '../../utils/Marks';
import { SettingsSlider } from './SettingsSlider';

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const [sliderValue, setSliderValue] = React.useState<number>(1);
  var multipliers: Multiplier[] = [];
  const GAME = null; // null means global

  // set multiplier value from perferences
  useEffect(() => {
    // find global multiplier
    multipliers = preferences.multipliers;
    const globalMultiplier = multipliers.find(
      (multiplier) => multiplier.game == GAME
    );

    // set the value of this multiplier for the slider
    if (globalMultiplier) {
      setSliderValue(globalMultiplier.multiplier);
    }
  }, []);

  const saveMultiplier = (game: string | null, value: number) => {
    setSliderValue(Number(value));
    const newPreferences: UserPreferences = {
      ...preferences,
      multipliers: [
        {
          game: game, // null means global
          sport: null, // null means all sports
          multiplier: value,
        },
        ...preferences.multipliers.filter(
          (multiplier) => multiplier.game !== game
        ),
      ],
    };
    setPreferences(newPreferences);
    setCookie('preferences', JSON.stringify(newPreferences), 999);
  };

  return (
    <Box>
      <SettingsSlider
        min={0}
        max={4}
        saveValue={saveMultiplier}
        setSliderValue={setSliderValue}
        sliderValue={sliderValue}
      ></SettingsSlider>
    </Box>
  );
};
