import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  CircularProgress,
  useMediaQuery,
  darken,
} from '@mui/material';
import { useSportStore } from '../useSportStore';
import { useDeathAmountStore } from './NumberSlider';
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from '../userStore';
import SportRow, { SportScore } from '../models/Sport';
import useErrorStore from '../zustand/Error';
import { alpha } from '@mui/material/styles';
import { useTotalScoreStore } from '../zustand/TotalScoreStore';
import AnimatedButton, { AnimatedRoundBtn } from './AnimatedButton';
import { useRecentSportsStore } from '../zustand/RecentSportsState';
import useCalculatorStore from '../zustand/CalculatorStore';
import { useThemeStore } from '../zustand/useThemeStore';
import { UserApi } from '../utils/api/Api';
import useUploadStore from '../zustand/UploadStore';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { UploadBuilder } from '../utils/api/UploadBuilder';
import { UploadError } from '../utils/errors/UploadError';
import SnoozeIcon from '@mui/icons-material/Snooze';
import { clamp } from 'date-fns';
import { blendWithContrast } from '../utils/blendWithContrast';

type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadOverdueDeaths = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountStore();
  const { user } = useUserStore();
  const { setErrorMessage } = useErrorStore();
  useTotalScoreStore();
  const { calculator } = useCalculatorStore();
  const { theme } = useThemeStore();

  // for triggers coming from outside (eg shortcut modal)

  const OnUploadClick = async () => {
    try {
      const uploadBuilder = UploadBuilder.default()
        .setUploadStrategy('overdueDeaths')
        .setStoreUpdate(false);

      await uploadBuilder.upload();
      uploadBuilder.updateStores();
    } catch (e) {
      setErrorMessage(String(e));
    }
  };
  if (
    !(
      currentSport &&
      user &&
      currentSport.sport_multiplier &&
      currentSport.game_multiplier
    )
  ) {
    return null;
  }

  const duration = amount !== 0 ? Math.max(20 - amount ** 1.5, 1) : 0;
  const isAnimationActive = duration !== 0;
  return (
    <Box>
      <Box
        sx={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          overflow: 'hidden',
          fontSize: '5rem',
        }}
      >
        <AnimatedRoundBtn onClick={OnUploadClick} duration={duration} circular>
          <Box
            sx={{
              fontSize: 'clamp(2rem, 4vh, 6rem)',
              color: isAnimationActive
                ? blendWithContrast(theme.palette.primary.main, theme, 0.3)
                : darken(theme.palette.primary.main, 0.2),
            }}
          >
            <SnoozeIcon fontSize="inherit"></SnoozeIcon>
          </Box>
        </AnimatedRoundBtn>
      </Box>
    </Box>
  );
};
