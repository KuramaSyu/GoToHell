import { Box, CssBaseline, Input, OutlinedInput, Slider } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { getCookie, setCookie } from '../../utils/cookies';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { Multiplier, UserPreferences } from '../../models/Preferences';
import { GenerateMarks } from '../../utils/Marks';

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

export interface SettingsSliderProperties {
  min: number;
  max: number;
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  saveValue: (game: string | null, value: number) => void;
}
export const SettingsSlider: React.FC<SettingsSliderProperties> = ({
  min,
  max,
  sliderValue,
  setSliderValue,
  saveValue,
}) => {
  const { marks } = GenerateMarks(4, min, max);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        backdropFilter: 'blur(25px)',
        padding: 5,
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}
    >
      <OutlinedInput
        value={sliderValue}
        type="number"
        onChange={(e) => {
          const value = parseFloat(e.target.value) || min;
          setSliderValue(value);
          saveValue(null, value);
        }}
        inputProps={{
          step: 0.05,
          style: {
            textAlign: 'center',
          },
        }}
        sx={{
          fontSize: '24px',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      />
      <Slider
        size="medium"
        value={sliderValue}
        marks={marks}
        onChange={(e, value) =>
          setSliderValue(Array.isArray(value) ? value[0] ?? min : value)
        }
        onChangeCommitted={(e, value) =>
          saveValue(null, Array.isArray(value) ? value[0] ?? min : value ?? min)
        }
        min={min}
        max={max}
        step={0.05}
      />
    </Box>
  );
};
