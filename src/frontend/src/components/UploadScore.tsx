import { delay, motion, useMotionValueEvent, useSpring } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box, Typography } from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { Sport, useSportStore } from '../useSportStore';
import { useDeathAmountState } from "./SportSelect";
import SendIcon from '@mui/icons-material/Send';


const map = new Map();
map.set("pushup", "Push-Ups")
map.set("plank", "Seconds Plank")

export const UploadScore = () => {
    const {currentSport} = useSportStore();
    const {amount} = useDeathAmountState();

    if (!currentSport) {
        // return <Button color="error" size="large">No Sport selected</Button> 
        return (<Box></Box>)
    }
    const computedValue = currentSport.death_multiplier * amount;
    return (
        <Button sx={{px: 8, py: 3}} variant="outlined" endIcon={<SendIcon fontWeight="large" />}>
            <Typography variant="h4" fontWeight="bold">Upload</Typography>
        </Button> 
    )
}
