import { Box, CssBaseline, Input, OutlinedInput, Slider } from '@mui/material';
import React, { useEffect } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import AppBackground from '../../components/AppBackground';
import { getCookie, setCookie } from '../../utils/cookies';
import { GameOverrideList, GameOverrideSettings } from './GameOverride';
import { Multiplier, UserPreferences } from '../../models/Preferences';

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const [sliderValue, setSliderValue] = React.useState<number>(1);
  var multipliers: Multiplier[] = [];
  const min = 0;
  const max = 4;
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
    const newPreferences: UserPreferences = {
      multipliers: [
        {
          game: game, // null means global
          sport: null, // null means all sports
          multiplier: sliderValue,
        },
        ...preferences.multipliers.filter(
          (multiplier) => multiplier.game !== game
        ),
      ],
      game_overrides: preferences.game_overrides,
    };
    setPreferences(newPreferences);
    setCookie('preferences', JSON.stringify(newPreferences), 999);
    setSliderValue(Number(value));
  };

  // iterate andcreate flex colums
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
          const value = parseFloat(e.target.value) || 0;
          saveMultiplier(GAME, value);
        }}
        inputProps={{
          step: 0.05,
          style: {
            textAlign: 'center', // Center the number in the input
          },
        }}
        sx={{
          fontSize: '24px',
          justifyContent: 'center',
          justifyItems: 'center',
          alignItems: 'center',
          display: 'flex',
          alignContent: 'center',
        }}
      ></OutlinedInput>
      <Slider
        size="medium"
        value={sliderValue}
        onChange={(e, value) =>
          // store just in state
          setSliderValue(Array.isArray(value) ? value[0] ?? 1 : value)
        }
        onChangeCommitted={(e, value) =>
          // store to cookie
          saveMultiplier(
            GAME,
            Array.isArray(value) ? value[0] ?? 1 : value ?? 1
          )
        }
        min={min}
        max={max}
        step={0.05}
      ></Slider>
    </Box>
  );
};
