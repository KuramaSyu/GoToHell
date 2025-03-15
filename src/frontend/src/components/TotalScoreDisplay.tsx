import { delay, motion, useMotionValueEvent, useSpring } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Button,
  Container,
  Box,
  Typography,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { SportDefinition, useSportStore } from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from '../userStore';
import SportRow, { SportScore } from '../models/Sport';
import useAppState from '../zustand/Error';
import { alpha } from '@mui/material/styles';
import { useTotalScoreStore } from '../zustand/TotalScoreStore';
import { PopNumber } from './GameSelect';

const map = new Map();
map.set('pushup', 'Push-Ups');
map.set('plank', 'Seconds Plank');

// returns the score of the kind
// game does not matter, since it's summed up
const GetScore = (kind: string, amounts: SportScore[]) => {
  const score = amounts.find((score) => score.kind === kind);
  return score?.amount || 0;
};

export const TotalScoreDisplay = () => {
  const { currentSport } = useSportStore();
  const { user } = useUserStore();
  const { amounts } = useTotalScoreStore();

  if (!currentSport || !user) {
    return <Typography></Typography>;
  }
  // const for current sport score display
  const currentSportString = currentSport ? (
    <Typography variant="h6">
      {map.get(currentSport.kind) || currentSport.kind}
    </Typography>
  ) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyItems: 'center' }}>
      <Box sx={{ mr: 2 }}>
        <PopNumber
          value={GetScore(currentSport!.kind, amounts)}
          font="Bebas Neue"
          stiffness={500}
          damping={200}
          mass={1}
        ></PopNumber>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
        }}
      >
        {currentSportString}
        <Typography variant="subtitle1" sx={{ justifyContent: 'center' }}>
          in total
        </Typography>
      </Box>
    </Box>
  );
};
