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
import SportRow, { SportAmount } from "../models/Sport";
import useAppState from "../zustand/Error";
import { alpha } from "@mui/material/styles";

const map = new Map();
map.set("pushup", "Push-Ups")
map.set("plank", "Seconds Plank")


type SnackbarState = "uploading" | "uploaded" | "failed" | null;

export const UploadScore = () => {
    const {currentSport} = useSportStore();
    const {amount} = useDeathAmountState();
    const {user} = useUserStore();
    const {setErrorMessage} = useAppState();
    const [snackbarState, setSnackbarState] = useState<SnackbarState>(null);

    const OnUploadClick = async () => {
        if (!currentSport) {
            return setErrorMessage("Please select a Sport first") 
        }

        if (amount == 0) {
            return setErrorMessage("Yeah, just upload nothing. Good idea indeed")
        }
        const startTime = new Date().getTime();
        setSnackbarState("uploading")
        try {
            const sport = new SportRow(currentSport.kind!, currentSport.game!, computedValue)
            console.timeLog(`Upload Sport: ${sport.toJson()}`)
            const fut = await sport.upload()
            const data = await fut.json();
            console.log(data)
            // Calculate elapsed time in milliseconds.
            const elapsedTime = new Date().getTime() - startTime;
            const minimumDuration = 1000; // 1 second in milliseconds

            // Wait for the rest of the minimum duration if necessary.
            if (elapsedTime < minimumDuration) {
                const remainingTime = minimumDuration - elapsedTime;
                await new Promise((resolve) => setTimeout(resolve, remainingTime));
            }
            if (fut.ok) {
                setSnackbarState("uploaded")
                const parsed_data: { message?: string, results?: SportAmount[] } = data;

                if (parsed_data.results) {
                    // data.results is now an array of SportAmount
                    console.log(data.results);
                }
            } else {
                setSnackbarState("failed")
            }
        } catch (error) {
            setSnackbarState("failed")
            //setErrorMessage("Any Error")
        }
        setTimeout(() => setSnackbarState(null), 2000);

    }
    if (!(currentSport && user)) {
        //setErrorMessage("Please Login")
        return (<Box></Box>)
    }
    const computedValue = currentSport.death_multiplier * amount;
    return (
        <Box>
        <Button 
        sx={{px: 8, py: 3}} 
        variant="outlined" 
        endIcon={<SendIcon fontWeight="large" />} 
            onClick={OnUploadClick}
        >
            <Typography variant="h4" fontWeight="bold">Upload</Typography>
        </Button>
        <Snackbar
        open={snackbarState != null}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        slotProps={{
            content: {
              sx: {
                backgroundColor: (theme: any) => alpha(theme.palette.secondary.main, 0.6),
                color: (theme: any) => theme.palette.primary.contrastText,
              },
            },
          }}
        message={
          snackbarState === "uploading" ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={30} sx={{ mr: 1 }} />
              Uploading...
            </Box>
          ) : snackbarState === "uploaded" ? (
            "Uploaded!"
          ) : snackbarState === null ? (
            ""
          ) : (
            "Failed!"
          )
          
        }
      />
        </Box>

    )
}
