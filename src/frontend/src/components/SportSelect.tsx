import { motion } from "framer-motion";
import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box, Typography, Slider, TextField } from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { create } from "zustand";

interface DeathAmountState {
    amount: number;
    setAmount: (value: number) => void;
}

export const useDeathAmountState = create<DeathAmountState>((set) => ({
    amount: 0, // initial state
    setAmount: (value: number) => set({ amount: value})
}))

export const SportSelector = () => {
    return (
        <Box>
            <NumberSlider></NumberSlider>
        </Box>
    )
}

const NumberSlider = () => {
    const {amount, setAmount} = useDeathAmountState();

    const min = 0;
    const max = 12;

    // Slider Change
    const handleSliderChange = (_: Event, newValue: number | number[]) => {
        setAmount(newValue as number)
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

    return (
        <Box sx={{ p: 2}}>
            <Typography variant="h6">How often did you die this time?</Typography>
            <Slider
                value={amount}
                onChange={handleSliderChange}
                min={min}
                max={max}
                step={1}
                aria-labelledby="number-slider"
            ></Slider>
            <TextField
                value={amount}
                onChange={handleInputChange}
                onBlur={handleBlur}
                type="number"
                sx={{ mt: 2, width: "100px"}}
            ></TextField>
        </Box>
    );
};