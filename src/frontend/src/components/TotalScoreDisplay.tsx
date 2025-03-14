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
import SportRow, { SportScore } from "../models/Sport";
import useAppState from "../zustand/Error";
import { alpha } from "@mui/material/styles";
import { useTotalScoreStore } from "../zustand/TotalScoreStore";

const map = new Map();
map.set("pushup", "Push-Ups")
map.set("plank", "Seconds Plank")


// returns the score of the kind
// game does not matter, since it's summed up
const GetScore = (kind: string, amounts: SportScore[]) => {
    const score = amounts.find((score) => score.kind === kind);
    return score?.amount || 0;
}



export const TotalScoreDisplay = () => {
    const {currentSport} = useSportStore();
    const {amount} = useDeathAmountState();
    const {user} = useUserStore();
    const {setErrorMessage} = useAppState();
    const {amounts} = useTotalScoreStore();
    
    // const for current sport score display
    const currentScoreDisplay = currentSport ? (
        <Typography variant="h6">
            {map.get(currentSport.kind) || currentSport.kind}: {GetScore(currentSport.kind, amounts)}
        </Typography>
    ) : null;

    return (
        <Box>
            <Typography variant="h4">Total Score</Typography>
            {currentScoreDisplay}
        </Box>

    )
}
