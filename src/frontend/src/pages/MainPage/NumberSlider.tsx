import { Box, Typography, Slider, Button, OutlinedInput } from '@mui/material';
import { create } from 'zustand';
import { Add, Remove } from '@mui/icons-material';
import { GenerateMarks } from '../../utils/Marks';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useState } from 'react';

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

export interface NumberSliderProps {
  withInput: boolean;
}

export const NumberSlider: React.FC<NumberSliderProps> = ({ withInput }) => {
  const { amount, setAmount } = useDeathAmountStore();
  const [localAmount, setLocalAmount] = useState<string | null>(
    amount.toString()
  );

  const { preferencesLoaded } = usePreferenceStore();
  const { theme } = useThemeStore();
  const min = Math.min(0, amount);
  const max = Math.max(12, amount);
  const selectableMax = 2 ** 20; // 2 ** 11 was default, but there are cases where more is needed3000
  const { isMobile } = useBreakpoint();

  // Slider Change - set value or current maximum
  const handleSliderChange = (newValue: number | number[]) => {
    const capped = Math.min(newValue as number, selectableMax);
    setAmount(capped);
    setLocalAmount(capped.toString());
  };

  // manual input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAmount(event.target.value);
    394;
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

  const AddButton = (
    <Button
      variant="contained"
      onClick={() => handleSliderChange(amount + 1)}
      sx={{
        borderRadius: '50%',
        width: '80%', // Make the button fill the container
        height: '80%', // Make the button fill the container
        minWidth: 0, // Ensure the button does not expand
        minHeight: 0, // Ensure the button does not expand
        aspectRatio: '1 / 1',
        display: 'flex',
      }}
    >
      <Add />
    </Button>
  );

  const RemoveButton = (
    <Button
      variant="contained"
      onClick={() => setAmount(amount - 1)}
      sx={{
        borderRadius: '50%',
        width: '80%', // Make the button fill the container
        height: '80%', // Make the button fill the container
        minWidth: 0, // Ensure the button does not expand
        minHeight: 0, // Ensure the button does not expand
        aspectRatio: '1 / 1',
        display: 'flex',
      }}
    >
      <Remove />
    </Button>
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
        height: '80%',
        display: 'flex',
        color: theme.palette.primary.main,
        fontSize: 'clamp(16px, 2vw, 24px)',
        textShadow: `0px 0px 8px ${theme.palette.text.secondary}`,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
      }}
    />
  ) : null;

  const customInputMobile = (
    <Box>
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
          width: 'clamp(60px, 50%, 300px)',
          //height: '80%',
          borderRadius: 5,
          display: 'flex',
          color: theme.palette.primary.main,
          fontSize: '4vh',
          textShadow: `0px 0px 8px ${theme.palette.text.secondary}`,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        }}
      />
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
      {RemoveButton}
      {AddButton}
    </Box>
  );

  // calculate the marks below the slider
  const getMarkAmount = () => {
    // start at 12, going down to 2 as the amount increases
    if (amount > 1000) {
      return 2;
    } else if (amount > 100) {
      return 4;
    } else if (amount > 50) {
      return 8;
    } else if (amount > 20) {
      return 10;
    } else {
      return 12;
    }
  };
  const { marks } = GenerateMarks(getMarkAmount(), min, max);
  const stepValue = 1;

  if (isMobile) {
    // Mobile view
    return (
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
          {customInputMobile}
        </Box>
      </Box>
    );
  }

  // Desktop view
  return (
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
      <Slider
        value={amount}
        onChange={(e, newValue) => handleSliderChange(newValue)}
        min={min}
        max={max}
        step={stepValue}
        aria-labelledby="number-slider"
        marks={marks}
      ></Slider>
    </Box>
  );
};
