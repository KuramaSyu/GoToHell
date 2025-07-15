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

type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadOverdueDeaths = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountStore();
  const { user } = useUserStore();
  const { setErrorMessage } = useErrorStore();
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(null);
  const { setAmounts, triggerRefresh: triggerScoreRefresh } =
    useTotalScoreStore();
  const { calculator } = useCalculatorStore();
  const { uploadTrigger } = useUploadStore();
  const { isMobile } = useBreakpoint();
  const { theme } = useThemeStore();

  // for triggers coming from outside (eg shortcut modal)

  const OnUploadClick = async () => {
    try {
      const startTime = new Date().getTime();
      const uploadBuilder = UploadBuilder.default()
        .setUploadStrategy('overdueDeaths')
        .setStoreUpdate(false);

      //setSnackbarState('uploading');

      // set timer to wait arteficially 1s, for upload animation
      await uploadBuilder.upload();
      uploadBuilder.updateStores();

      //setSnackbarState('uploaded');
    } catch (e) {
      // handle uplaod error - description is in error included
      //setSnackbarState('failed');
      setErrorMessage(String(e));
    }

    setTimeout(() => setSnackbarState(null), 2000);
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
  const computedValue = calculator.calculate_amount(
    currentSport.sport!,
    currentSport.game!,
    amount
  );
  const duration = amount !== 0 ? Math.max(40 - amount ** 1.5, 8) : 0;
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
                ? darken(theme.palette.primary.main, 0.1)
                : darken(theme.palette.primary.main, 0.3),
            }}
          >
            <SnoozeIcon fontSize="inherit"></SnoozeIcon>
          </Box>
        </AnimatedRoundBtn>
      </Box>
      {/* <Snackbar
        open={snackbarState != null}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          content: {
            sx: {
              backgroundColor: (theme: any) =>
                alpha(theme.palette.secondary.main, 0.6),
              color: (theme: any) => theme.palette.primary.contrastText,
            },
          },
        }}
        message={
          snackbarState === 'uploading' ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={30} sx={{ mr: 1 }} />
              Uploading...
            </Box>
          ) : snackbarState === 'uploaded' ? (
            'Uploaded!'
          ) : snackbarState === null ? (
            ''
          ) : (
            'Failed!'
          )
        }
      /> */}
    </Box>
  );
};
