import React from 'react';
import { Box, Typography, Slider, TextField } from '@mui/material';
import { create } from 'zustand';

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

const NumberSlider = () => {
  const { amount, setAmount } = useDeathAmountState();

  const min = 0;
  const max = 12;

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

  const handleBlur = () => {
    if (amount < min) setAmount(min);
    if (amount > max) setAmount(max);
  };
  var marks = [];
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
        <Typography variant="h5">How many deaths?</Typography>
        <TextField
          value={amount}
          slotProps={{ htmlInput: { style: { fontSize: '2rem' } } }}
          onChange={handleInputChange}
          onBlur={handleBlur}
          type="number"
          sx={{ m: 0, maxWidth: 1 / 3 }}
        ></TextField>
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
