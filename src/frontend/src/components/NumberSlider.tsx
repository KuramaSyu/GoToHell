import {
  Box,
  Typography,
  Slider,
  useTheme,
  Button,
  Input,
} from '@mui/material';
import { create } from 'zustand';
import { Add, Remove } from '@mui/icons-material';

interface DeathAmountState {
  amount: number;
  setAmount: (value: number) => void;
}

export const useDeathAmountState = create<DeathAmountState>((set) => ({
  amount: 0, // initial state
  setAmount: (value: number) => set({ amount: value }),
}));

export const DeathSlider = () => {
  return (
    <Box>
      <NumberSlider></NumberSlider>
    </Box>
  );
};

const NumberSlider = (withCustomInput: boolean) => {
  const { amount, setAmount } = useDeathAmountState();
  const theme = useTheme();
  const min = Math.min(0, amount);
  const max = Math.max(12, amount);

  // Slider Change
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setAmount(newValue as number);
  };

  // manual input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = Number(event.target.value);
    if (!isNaN(newValue)) {
      if (amount < min) newValue = min;
      setAmount(newValue);
    }
  };

  const title = (
    <Typography
      variant="h5"
      sx={{
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

  const customInput = <Input></Input>;

  const AddRemoveButtons = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {AddButton}
      {RemoveButton}
    </Box>
  );

  // const handleBlur = () => {
  //   if (amount < min) setAmount(min);
  //   if (amount > max) setAmount(max);
  // };
  var marks: { value: number; label: string }[] = [];
  for (let i = min; i <= max; i++) {
    marks.push({ value: i, label: i.toString() });
  }
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
      <Slider
        value={amount}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={1}
        aria-labelledby="number-slider"
        marks={marks}
      ></Slider>
    </Box>
  );
};
