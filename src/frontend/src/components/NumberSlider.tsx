import {
  Box,
  Typography,
  Slider,
  useTheme,
  Button,
  OutlinedInput,
  useMediaQuery,
} from '@mui/material';
import { create } from 'zustand';
import { Add, Remove } from '@mui/icons-material';
import { GenerateMarks } from '../utils/Marks';
import usePreferenceStore from '../zustand/PreferenceStore';
import { useThemeStore } from '../zustand/useThemeStore';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface DeathAmountState {
  amount: number;
  setAmount: (value: number) => void;
}

export const useDeathAmountStore = create<DeathAmountState>((set) => ({
  amount: 0, // initial state
  setAmount: (value: number) => set({ amount: value }),
}));

export interface NumberSliderProps {
  withInput: boolean;
}

export const NumberSlider: React.FC<NumberSliderProps> = ({ withInput }) => {
  const { amount, setAmount } = useDeathAmountStore();
  const { preferencesLoaded } = usePreferenceStore();
  const { theme } = useThemeStore();
  const min = Math.min(0, amount);
  const max = Math.max(12, amount);
  const selectableMax = 2 ** 11;
  const { isMobile } = useBreakpoint();

  // Slider Change - set value or current maximum
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setAmount(Math.min(newValue as number, selectableMax));
  };

  // manual input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = Number(event.target.value);
    if (!isNaN(newValue)) {
      if (newValue > selectableMax) newValue = selectableMax;
      setAmount(newValue);
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
      onClick={() => setAmount(amount + 1)}
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
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant="h6">Too often?</Typography>
      <OutlinedInput
        value={amount}
        placeholder="Amount"
        onChange={handleInputChange}
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
    </Box>
  ) : null;

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
  const { marks } = GenerateMarks(12, min, max);
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
        {withInput ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            {customInput}
          </Box>
        ) : (
          <Slider
            value={amount}
            onChange={handleSliderChange}
            min={min}
            max={max}
            step={1}
            aria-labelledby="number-slider"
            marks={GenerateMarks(12, min, max).marks}
          />
        )}
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
        {title}
        {AddRemoveButtons}
      </Box>
      {customInput}
      <Slider
        value={amount}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={stepValue}
        aria-labelledby="number-slider"
        marks={marks}
      ></Slider>
    </Box>
  );
};
