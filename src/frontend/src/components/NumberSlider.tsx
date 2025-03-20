import {
  Box,
  Typography,
  Slider,
  useTheme,
  Button,
  Input,
  OutlinedInput,
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

export interface NumberSliderProps {
  withInput: boolean;
}

export const NumberSlider: React.FC<NumberSliderProps> = ({ withInput }) => {
  const { amount, setAmount } = useDeathAmountState();
  const theme = useTheme();
  const min = Math.min(0, amount);
  const max = Math.max(12, amount);
  const selectableMax = 2 ** 11;

  // Slider Change
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

  const customInput = (
    <OutlinedInput
      value={amount}
      placeholder="Amount"
      onChange={handleInputChange}
      inputProps={{
        inputMode: 'numeric',
        style: { textAlign: 'center' }, // center the number
      }}
      sx={{
        color: theme.palette.primary.main,
        fontSize: '24px',
        textShadow: `0px 0px 8px ${theme.palette.text.secondary}`,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
      }}
    />
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
      {withInput ? customInput : <Box />}
      {RemoveButton}
      {AddButton}
    </Box>
  );

  // const handleBlur = () => {
  //   if (amount < min) setAmount(min);
  //   if (amount > max) setAmount(max);
  // };
  var marks: { value: number; label: string }[] = [];
  const stepValue = amount < 15 ? 1 : Math.ceil(amount / 10);
  for (let i = min; i <= max; i += stepValue) {
    marks.push({ value: i, label: i.toString() });
  }
  if (Number(marks[-1]) !== max) {
    marks.push({ value: max, label: max.toString() });
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
        step={stepValue}
        aria-labelledby="number-slider"
        marks={marks}
      ></Slider>
    </Box>
  );
};
