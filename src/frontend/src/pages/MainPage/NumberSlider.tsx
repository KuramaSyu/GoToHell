import {
  Box,
  Typography,
  Slider,
  Button,
  OutlinedInput,
  IconButton,
  alpha,
  Tooltip,
} from '@mui/material';
import { create } from 'zustand';
import { Add, Remove } from '@mui/icons-material';
import { GenerateMarks } from '../../utils/Marks';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useEffect, useState } from 'react';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { useSportStore } from '../../useSportStore';

interface DeathAmountState {
  amount: number;
  setAmount: (value: number) => void;
}

/**
 * Represents a store which keeps track of the amount of deaths the user has
 */
export const useDeathAmountStore = create<DeathAmountState>((set) => ({
  amount: 0, // initial state
  setAmount: (value: number) => set({ amount: value }),
}));

type InputVariant = 'default' | 'custom';

export interface InputStrategyProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  disabled?: boolean;
}

export interface NumberSliderProps {
  withInput: InputVariant;
}

export const NumberSlider: React.FC<NumberSliderProps> = ({ withInput }) => {
  // actual amount
  const { amount, setAmount } = useDeathAmountStore();

  // string for input box (so that .0 or something like this can be typed)
  const [localAmount, setLocalAmount] = useState<string | null>(
    amount.toString()
  );

  const { preferencesLoaded } = usePreferenceStore();
  const { theme } = useThemeStore();

  const selectableMax = 2 ** 20; // 2 ** 11 was default, but there are cases where more is needed3000
  const { isMobile } = useBreakpoint();

  const INPUT_STRATEGIES: Record<InputVariant, React.FC<InputStrategyProps>> = {
    default: SliderInput,
    custom: CustomSliderInput,
  };
  const STEP_VALUES: Record<InputVariant, number> = {
    default: 1,
    custom: 1,
  };
  const TOOLTIP_TEXT: Record<InputVariant, string> = {
    default: 'How often did you die?',
    custom: `How many units of ${
      useSportStore.getState().currentSport.sport
    } did you do?`,
  };
  const SliderComponent = INPUT_STRATEGIES[withInput];
  const stepValue = STEP_VALUES[withInput];
  const tooltipText = TOOLTIP_TEXT[withInput];

  // when amount is changed, also update the input box amount (localAmount)
  // amount is changed from slider or modal
  useEffect(() => {
    if (Number(localAmount) !== amount) {
      setLocalAmount(amount.toString());
    }
  }, [amount]);

  // Slider Change - set value or current maximum
  const handleSliderChange = (newValue: number | number[]) => {
    const capped = Math.min(newValue as number, selectableMax);
    setAmount(capped);
    setLocalAmount(capped.toString());
  };

  // manual input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAmount(event.target.value);
    let newValue = Number(event.target.value);
    if (!isNaN(newValue)) {
      if (newValue > selectableMax) newValue = selectableMax;
      setAmount(newValue);
      if (event.target.value !== '') {
        setLocalAmount(newValue.toString());
      }
    }
  };

  if (!preferencesLoaded || theme.custom.themeName === 'default') {
    // the displayed games depend on preferences, so we wait until they are loaded
    // which is done in the theme store
    return null;
  }

  const title = (
    <Typography
      sx={{
        fontSize: 'clamp(16px, 2vw, 24px)',
        fontWeight: 'bold',
        WebkitTextFillColor: `${theme.palette.text.primary}`,
        textShadow: `0 0 20px ${theme.palette.secondary.main}, 0 0 20px ${theme.palette.secondary.main}`,
      }}
    >
      How many deaths?
    </Typography>
  );

  const customInput = withInput ? (
    <OutlinedInput
      value={localAmount}
      placeholder="Amount"
      onChange={handleInputChange}
      error={isNaN(Number(localAmount))}
      inputProps={{
        inputMode: 'numeric',
        style: { textAlign: 'center' }, // center the number
      }}
      sx={{
        width: 'clamp(40px, 35%, 200px)',
        display: 'flex',
        color: blendWithContrast(theme.palette.muted.dark, theme, 2 / 3),
        backgroundColor: theme.palette.muted.dark,
        fontSize: 'clamp(16px, 2.5vw, 24px)',
        textShadow: `0px 0px 8px ${theme.palette.text.secondary}`,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
      }}
    />
  ) : null;

  const customInputMobile = (
    <Box sx={{ position: 'relative', height: '100%', ml: 3 }}>
      <OutlinedInput
        value={localAmount}
        placeholder="Amount"
        onChange={handleInputChange}
        error={isNaN(Number(localAmount))}
        inputProps={{
          inputMode: 'numeric',
          style: { textAlign: 'center' }, // center the number
        }}
        sx={{
          height: '100%',
          borderRadius: 8,
          display: 'flex',
          color: blendWithContrast(theme.palette.muted.dark, theme, 2 / 3),
          backgroundColor: theme.palette.muted.dark,
          fontSize: '4vh',
          fontWeight: 600,
          borderWidth: 0,
          textShadow: `0px 0px 8px ${theme.palette.text.secondary}`,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: 6 / 21,
          left: 'calc(-1 * (6/21 * 100%) / pi)',
          top: 'calc(-1 * (6/21 * 100%) / (pi/2))',
        }}
      >
        <RemoveButton
          onChange={handleSliderChange}
          amount={amount}
          stepValue={stepValue}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          width: 9 / 20,
          left: 'calc(-1 * (9/20 * 100%) / pi)',
          bottom: 'calc(-1 * (9/20 * 100%) / (pi/2))',
        }}
      >
        <AddButton
          onChange={handleSliderChange}
          amount={amount}
          stepValue={stepValue}
        />
      </Box>
    </Box>
  );

  const AddRemoveButtons = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
        maxWidth: 2 / 3,
      }}
    >
      <RemoveButton
        onChange={handleSliderChange}
        amount={amount}
        stepValue={stepValue}
      />
      <AddButton
        onChange={handleSliderChange}
        amount={amount}
        stepValue={stepValue}
      />
    </Box>
  );

  if (isMobile) {
    // Mobile view
    return <Box sx={{ height: '100%' }}> {customInputMobile} </Box>;
  }

  // Desktop view
  return (
    <Tooltip title={tooltipText} arrow>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {withInput ? customInput : title}
          {AddRemoveButtons}
        </Box>
        <SliderComponent
          value={amount}
          onChange={handleSliderChange}
          step={stepValue}
        />
      </Box>
    </Tooltip>
  );
};

const SliderInput: React.FC<InputStrategyProps> = ({
  value,
  onChange,
  step,
  disabled,
}) => {
  const min = Math.min(0, value);
  const max = Math.max(12, value);
  // calculate the marks below the slider
  const getMarkAmount = () => {
    // start at 12, going down to 2 as the amount increases
    if (value > 1000) {
      return 2;
    } else if (value > 100) {
      return 4;
    } else if (value > 50) {
      return 8;
    } else if (value > 20) {
      return 10;
    } else {
      return 12;
    }
  };
  const { marks } = GenerateMarks(getMarkAmount(), min, max);

  return (
    <Slider
      value={value}
      onChange={(e, newValue) => onChange(newValue as number)}
      min={min}
      max={max}
      step={step}
      aria-labelledby="number-slider"
      marks={marks}
    ></Slider>
  );
};

// Custom slider from 0-100 with steps of 5
const CustomSliderInput: React.FC<InputStrategyProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const min = Math.min(0, value);
  const max = Math.max(100, value);
  const { marks } = GenerateMarks(5, min, max);

  // TODO: make step depend on sport (plank needs bigger step then pushup)
  return (
    <Slider
      value={value}
      onChange={(e, newValue) => onChange(newValue as number)}
      min={min}
      max={max}
      step={5}
      aria-labelledby="number-slider"
      marks={marks}
    ></Slider>
  );
};

interface AddRemoveButtonProps {
  onChange: (amount: number) => void;
  amount: number;
  stepValue: number;
}

const AddButton: React.FC<AddRemoveButtonProps> = ({
  onChange,
  amount,
  stepValue,
}) => {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();

  return (
    <Button
      variant="contained"
      onClick={() => onChange(amount + stepValue)}
      sx={{
        borderRadius: '50%',
        width: '80%', // Make the button fill the container
        height: '80%', // Make the button fill the container
        minWidth: 0, // Ensure the button does not expand
        minHeight: 0, // Ensure the button does not expand
        aspectRatio: '1 / 1',
        display: 'flex',
        backgroundColor: isMobile ? theme.palette.primary.main : undefined,
        color: isMobile
          ? blendWithContrast(theme.palette.primary.main, theme, 2 / 3)
          : undefined,
      }}
    >
      <Add fontSize={isMobile ? 'large' : undefined} />
    </Button>
  );
};

const RemoveButton: React.FC<AddRemoveButtonProps> = ({
  onChange,
  amount,
  stepValue,
}) => {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();

  return (
    <Button
      variant="contained"
      onClick={() => onChange(amount - stepValue)}
      sx={{
        borderRadius: '50%',
        width: '80%', // Make the button fill the container
        height: '80%', // Make the button fill the container
        minWidth: 0, // Ensure the button does not expand
        minHeight: 0, // Ensure the button does not expand
        aspectRatio: '1 / 1',
        display: 'flex',
        backgroundColor: isMobile ? theme.palette.secondary.main : undefined,
        color: isMobile
          ? blendWithContrast(theme.palette.secondary.main, theme, 2 / 3)
          : undefined,
      }}
    >
      <Remove />
    </Button>
  );
};
