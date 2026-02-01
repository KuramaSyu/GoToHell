import {
  alpha,
  Box,
  Button,
  Input,
  OutlinedInput,
  Slider,
  Tooltip,
  Typography,
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
import { handleStringNumber, StringNumberProps } from '../../utils/UserNumber';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { hexToRgbString } from '../../utils/colors/hexToRgb';
import { BoxElevation2 } from '../../theme/statics';

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
  const [stringNumber, setStringNumber] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    setStringNumber(String(sliderValue));
  }, [sliderValue]);

  const defaultProps: StringNumberProps = {
    number: sliderValue,
    setNumber: setSliderValue,
    stringNumber: stringNumber,
    setStringNumber: setStringNumber,
    overrideStringNumber: false,
  };

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
        value={stringNumber ?? String(min)}
        type='number'
        onChange={(e) => {
          setStringNumber(e.target.value);
          const value = handleStringNumber({
            ...defaultProps,
            stringNumber: e.target.value,
          });
          if (value === null) return;
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
          width: '15%',
          minWidth: '150px', // Minimum width of 20px
          maxWidth: '400px', // Maximum width of 100px
          display: {
            xs: 'none',
            sm: 'flex',
          },
        }}
      />

      {/* Col for Add and Remove button */}
      <PlusMinusCol
        sliderValue={sliderValue}
        game={null}
        saveValue={saveValue}
        setSliderValue={setSliderValue}
        setStringNumber={setStringNumber}
        step={step}
      />

      <Slider
        size={isMobile ? 'small' : 'medium'}
        value={sliderValue ?? min}
        marks={marks}
        onChange={(_e, value) =>
          // set conent of Input Box to number
          handleStringNumber({
            ...defaultProps,
            overrideStringNumber: true,
            number: value,
          })
        }
        onChangeCommitted={(e, value) => {
          handleStringNumber({
            ...defaultProps,
            overrideStringNumber: true,
            number: value,
          });
          saveValue(null, value);
        }}
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
  const [stringNumber, setStringNumber] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const defaultProps: StringNumberProps = {
    number: sliderValue,
    setNumber: setSliderValue,
    stringNumber: stringNumber,
    setStringNumber: setStringNumber,
    overrideStringNumber: false,
  };

  // update sliderValue if another game is selected
  useEffect(() => {
    setUsedMultiplier(undefined);
    const actualMultiplier = getCurrentMultiplier();
    setUsedMultiplierAndUpdateValue(actualMultiplier?.game);
  }, [theme]);

  // when selecting, set from undefined to null
  useEffect(() => {
    setUsedMultiplierAndUpdateValue(undefined);
  }, []);

  /**
   * returns the color of the button, depending if it's selected or not
   * @param btn same as usedMultiplier
   */
  const getBackgroundColor = (btn: null | string) => {
    const isSelected = btn == usedMultiplier;
    if (isSelected) {
      return theme.palette.secondary.main;
    } else {
      return null;
    }
  };

  /**
   * returns the text color of the button, depending if it's selected or not
   * @param btn same as usedMultiplier
   */
  const getTextColor = (btn: null | string) => {
    const isSelected = btn == usedMultiplier;
    if (isSelected) {
      return theme.palette.secondary.contrastText;
    } else {
      return theme.palette.text.secondary;
    }
  };

  const getCurrentMultiplier = () => {
    const multiplierCalculator = new MultiplierDecorator(
      new DefaultSportsCalculator(
        useSportResponseStore.getState().sportResponse ??
          useSportResponseStore.getState().emptySportsResponse(),
      ),
      preferences.multipliers,
    );
    const multiplier = multiplierCalculator.get_multiplier(
      '',
      theme.custom.themeName,
    );
    return multiplier;
  };

  /**
   * Updates the sliderValue by useing the MultiplierDecorator.
   * Also Updates the string value.
   *
   * The value is determined by the Decorator stack, with returns the
   * multiplier which should be used. this multipliers value will be set
   * for both states
   */
  const UpdateSliderValue = () => {
    const multiplier = getCurrentMultiplier();
    const number = multiplier?.multiplier ?? 1;
    setSliderValue(number);
    setStringNumber(String(number));
  };

  /**
   * This function updates the usedMultiplierStore and then sets the slider value. The Slider value will
   * be calcuated with the MultiplierDecorator, to get the right multiplier, depending on the usedMultiplierStore.
   * If the Decorator returns null, 1 will be used as value
   */
  const setUsedMultiplierAndUpdateValue = (
    usedMultiplier: string | null | undefined,
  ) => {
    setUsedMultiplier(usedMultiplier);
    UpdateSliderValue();
  };

  const updateSilderVlaueByStep = (step: number) => {
    var value = (sliderValue ?? 0) + step;
    // round value to .2f to prevent float issues
    value = Math.round(value * 100) / 100;
    saveValue(usedMultiplier ?? null, value);
    setSliderValue(value);
    setStringNumber(String(value));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        padding: 3,
        borderRadius: 4,
        ...BoxElevation2(theme),
      }}
    >
      <OutlinedInput
        value={stringNumber ?? String(min)}
        color='secondary'
        onChange={(e) => {
          setStringNumber(e.target.value);
          const value = handleStringNumber({
            ...defaultProps,
            stringNumber: e.target.value,
          });
          if (value === null) return;
          saveValue(null, value);
        }}
        inputProps={{
          style: {
            textAlign: 'center',
          },
        }}
        sx={{
          fontSize: '24px',
          justifyContent: 'center',
          alignItems: 'center',
          width: '10%', // Set width to 1/10
          minWidth: '100px', // Minimum width of 20px
          maxWidth: '300px', // Maximum width of 100px
          display: {
            xs: 'none',
            sm: 'flex',
          },
        }}
      />

      {/* Col for Add and Remove button */}
      <PlusMinusCol
        sliderValue={sliderValue}
        game={usedMultiplier}
        saveValue={saveValue}
        setSliderValue={setSliderValue}
        setStringNumber={setStringNumber}
        step={step}
      />
      {/* Col for Global or Game Switch */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1,
          xs: 'block',
        }}
      >
        <Tooltip
          title='Global Multiplier to adjust all Games at once'
          arrow
          placement='right'
        >
          <Button
            onClick={() => setUsedMultiplierAndUpdateValue(null)}
            sx={{
              backgroundColor: getBackgroundColor(null),
              color: getTextColor(null),
              whiteSpace: 'nowrap', // Prevent text wrapping
              justifyContent: 'center',
            }}
          >
            Global
          </Button>
        </Tooltip>
        <Tooltip
          title={`Multiplier just for ${theme.custom.themeName}. This won't effect other games`}
          arrow
          placement='right'
        >
          <Button
            sx={{
              backgroundColor: getBackgroundColor(theme.custom.themeName),
              color: getTextColor(theme.custom.themeName),
              whiteSpace: 'nowrap', // Prevent text wrapping
              justifyContent: 'center',
            }}
            onClick={() =>
              setUsedMultiplierAndUpdateValue(theme.custom.themeName)
            }
          >
            {theme.custom.themeName}
          </Button>
        </Tooltip>
      </Box>
      <Tooltip
        title={
          'Multiplier to increase (>1) or decrease (<1) the amount of exercises'
        }
        arrow
        placement='top'
      >
        <Slider
          size={isMobile ? 'small' : 'medium'}
          color='secondary'
          value={sliderValue ?? min}
          marks={marks}
          onChange={(_e, value) => {
            handleStringNumber({
              ...defaultProps,
              overrideStringNumber: true,
              number: value,
            });
          }}
          onChangeCommitted={(_e, value) => {
            handleStringNumber({
              ...defaultProps,
              overrideStringNumber: true,
              number: value,
            });

            saveValue(usedMultiplier ?? null, value);
          }}
          min={min}
          max={max}
          step={step}
        />
      </Tooltip>
    </Box>
  );
};

interface PlusMinusColProps {
  sliderValue: number | null;
  step: number;
  game: string | null | undefined;
  saveValue: (game: string | null, value: number) => void;
  setSliderValue: React.Dispatch<React.SetStateAction<number | null>>;
  setStringNumber: React.Dispatch<React.SetStateAction<string | null>>;
}
const PlusMinusCol: React.FC<PlusMinusColProps> = ({
  sliderValue,
  game,
  step,
  saveValue,
  setSliderValue,
  setStringNumber,
}: PlusMinusColProps) => {
  const { theme } = useThemeStore();
  const updateSilderVlaueByStep = (step: number) => {
    var value = (sliderValue ?? 0) + step;
    // round value to .2f to prevent float issues
    value = Math.round(value * 100) / 100;
    saveValue(game ?? null, value);
    setSliderValue(value);
    setStringNumber(String(value));
  };

  return (
    <Box
      sx={{
        flexDirection: 'column',
        height: '100%',
        gap: 1,
        display: {
          xs: 'none', // dont show on mobile
          sm: 'flex',
        },
      }}
    >
      <Button
        sx={{
          color: theme.palette.secondary.contrastText,
          backgroundColor: theme.palette.secondary.main,
        }}
        onClick={() => updateSilderVlaueByStep(step)}
      >
        <Add></Add>
      </Button>

      <Button
        sx={{
          color: theme.palette.secondary.contrastText,
          backgroundColor: theme.palette.secondary.main,
        }}
        onClick={() => updateSilderVlaueByStep(-step)}
      >
        <Remove></Remove>
      </Button>
    </Box>
  );
};
