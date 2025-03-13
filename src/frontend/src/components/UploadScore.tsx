import { delay, motion, useMotionValueEvent, useSpring } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box, Typography } from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { SportDefinition, useSportStore } from '../useSportStore';
import { useDeathAmountState } from "./SportSelect";
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from "../userStore";
import SportRow from "../models/Sport";
import useAppState from "../zustand/Error";


const map = new Map();
map.set("pushup", "Push-Ups")
map.set("plank", "Seconds Plank")

export const UploadScore = () => {
    const {currentSport} = useSportStore();
    const {amount} = useDeathAmountState();
    const {user} = useUserStore();
    const {setErrorMessage} = useAppState();

    const OnUploadClick = () => {
        if (!currentSport) {
            return setErrorMessage("Please select a Sport first") 
        }

        if (amount == 0) {
            return setErrorMessage("Yeah, just upload nothing. Good idea indeed")
        }
        const handlePostRequest = async () => {
            const sport = new SportRow(currentSport.kind!, currentSport.game!, computedValue)
            console.timeLog(`Upload Sport: ${sport.toJson()}`)
            const fut = sport.upload()
        }

    }
    if (!(currentSport && user)) {
        //setErrorMessage("Please Login")
        return (<Box></Box>)
    }
    const computedValue = currentSport.death_multiplier * amount;
    return (
        <Button 
        sx={{px: 8, py: 3}} 
        variant="outlined" 
        endIcon={<SendIcon fontWeight="large" />} 
            onClick={OnUploadClick}
        >
            <Typography variant="h4" fontWeight="bold">Upload</Typography>
        </Button> 
    )
}
