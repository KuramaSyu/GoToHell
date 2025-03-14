import { delay, motion, useMotionValueEvent, useSpring } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box, Typography, Snackbar, CircularProgress } from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { SportDefinition, useSportStore } from '../useSportStore';
import { useDeathAmountState } from "./SportSelect";
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from "../userStore";
import SportRow from "../models/Sport";
import useAppState from "../zustand/Error";
import { alpha } from "@mui/material/styles";

const map = new Map();
map.set("pushup", "Push-Ups")
map.set("plank", "Seconds Plank")


export const TotalScoreDisplay = () => {
    const {currentSport} = useSportStore();
    const {amount} = useDeathAmountState();
    const {user} = useUserStore();
    const {setErrorMessage} = useAppState();

    
    return (
        <Box>
       
        </Box>

    )
}
