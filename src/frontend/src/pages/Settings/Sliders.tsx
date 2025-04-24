import {
  alpha,
  Box,
  Button,
  Input,
  OutlinedInput,
  Slider,
} from '@mui/material';
import { GenerateMarks } from '../../utils/Marks';
import { Add, Remove } from '@mui/icons-material';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useEffect, useState } from 'react';
import { useUsedMultiplierStore } from '../../zustand/usedMultiplierStore';
import {
  DefaultSportsCalculator,
  MultiplierDecorator,
} from '../../utils/SportCalculator';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import usePreferenceStore from '../../zustand/PreferenceStore';

export interface SettingsSliderProperties {
  min: number;
  max: number;
  sliderValue: number | null;
  setSliderValue: React.Dispatch<React.SetStateAction<number | null>>;
  saveValue: (game: string | null, value: number) => void;
  step?: number;
}
export const SettingsSlider: React.FC<SettingsSliderProperties> = ({
  min,
  max,
  sliderValue,
  setSliderValue,
  saveValue,
  step = 0.05,
}) => {
  const { marks } = GenerateMarks(4, min, max);
  const { theme } = useThemeStore();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        backdropFilter: 'blur(25px)',
        padding: 3,
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
          step: step,
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

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1,
        }}
      >
        <Add
          sx={{ borderRadius: '100%', backgroundColor: alpha('#000000', 0.2) }}
        ></Add>
        <Remove
          sx={{ borderRadius: '100%', backgroundColor: alpha('#000000', 0.2) }}
        ></Remove>
      </Box>
      <Slider
        size="medium"
        value={sliderValue ?? min}
        marks={marks}
        onChange={(e, value) => setSliderValue(value)}
        onChangeCommitted={(e, value) => saveValue(null, value)}
        min={min}
        max={max}
        step={step}
      />
    </Box>
  );
};

export const MultiplierSlieder: React.FC<SettingsSliderProperties> = ({
  min,
  max,
  sliderValue,
  setSliderValue,
  saveValue,
  step = 0.05,
}) => {
  const { marks } = GenerateMarks(4, min, max);
  const { theme } = useThemeStore();
  const { usedMultiplier, setUsedMultiplier } = useUsedMultiplierStore(); // null means global
  const { preferences } = usePreferenceStore();

  // update sliderValue if another game is selected
  useEffect(() => {
    if (usedMultiplier !== null && usedMultiplier !== undefined)
      setUsedMultiplier(theme.custom.themeName);
    UpdateSliderValue();
  }, [theme]);

  /**
   * returns the color of the button, depending if it's selected or not
   * @param btn same as usedMultiplier
   */
  const getColor = (btn: null | string) => {
    if (btn == usedMultiplier) {
      return theme.palette.secondary.main;
    } else {
      return null;
    }
  };

  /**
   * Updates the sliderValue by useing the MultiplierDecorator.
   */
  const UpdateSliderValue = () => {
    const multiplierCalculator = new MultiplierDecorator(
      new DefaultSportsCalculator(
        useSportResponseStore.getState().sportResponse ??
          useSportResponseStore.getState().emptySportsResponse()
      ),
      preferences.multipliers
    );
    const multiplier = multiplierCalculator.get_multiplier(
      '',
      theme.custom.themeName
    );
    setSliderValue(multiplier?.multiplier ?? 1);
  };

  /**
   * This function updates the usedMultiplierStore and then sets the slider value. The Slider value will
   * be calcuated with the MultiplierDecorator, to get the right multiplier, depending on the usedMultiplierStore.
   * If the Decorator returns null, 1 will be used as value
   */
  const setUsedMultiplierAndUpdateValue = (usedMultiplier: string | null) => {
    setUsedMultiplier(usedMultiplier);
    UpdateSliderValue();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        backdropFilter: 'blur(25px)',
        padding: 3,
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
          step: step,
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

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1,
        }}
      >
        <Button
          sx={{
            backgroundColor: alpha('#000000', 0.2),
          }}
          onClick={() => setSliderValue((sliderValue ?? 0) + step)}
        >
          <Add></Add>
        </Button>
        <Button
          sx={{
            backgroundColor: alpha('#000000', 0.2),
          }}
          onClick={() => setSliderValue((sliderValue ?? 0) - step)}
        >
          <Remove></Remove>
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1,
        }}
      >
        <Button
          onClick={() => setUsedMultiplierAndUpdateValue(null)}
          sx={{ backgroundColor: getColor(null) }}
        >
          Global
        </Button>
        <Button
          sx={{ backgroundColor: getColor(theme.custom.themeName) }}
          onClick={() =>
            setUsedMultiplierAndUpdateValue(theme.custom.themeName)
          }
        >
          {theme.custom.themeName}
        </Button>
      </Box>
      <Slider
        size="medium"
        value={sliderValue ?? min}
        marks={marks}
        onChange={(_e, value) => setSliderValue(value)}
        onChangeCommitted={(_e, value) =>
          saveValue(usedMultiplier ?? null, value)
        }
        min={min}
        max={max}
        step={step}
      />
    </Box>
  );
};
