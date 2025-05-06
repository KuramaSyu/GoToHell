import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useSportStore } from '../useSportStore';
import { useDeathAmountStore } from './NumberSlider';
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from '../userStore';
import SportRow, { SportScore } from '../models/Sport';
import useErrorStore from '../zustand/Error';
import { alpha } from '@mui/material/styles';
import { useTotalScoreStore } from '../zustand/TotalScoreStore';
import AnimatedButton from './AnimatedButton';
import { useRecentSportsStore } from '../zustand/RecentSportsState';
import useCalculatorStore from '../zustand/CalculatorStore';
import { useThemeStore } from '../zustand/useThemeStore';
import { UserApi } from '../utils/api/Api';
import useUploadStore from '../zustand/UploadStore';

type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadScore = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountStore();
  const { user } = useUserStore();
  const { setErrorMessage } = useErrorStore();
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(null);
  const { setAmounts, triggerRefresh: triggerScoreRefresh } =
    useTotalScoreStore();
  const { calculator } = useCalculatorStore();
  const { theme } = useThemeStore();
  const { uploadTrigger } = useUploadStore();

  // for triggers coming from outside (eg shortcut modal)
  useEffect(() => {
    if (uploadTrigger === 0) return;
    OnUploadClick().finally();
  }, [uploadTrigger]);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const OnUploadClick = async () => {
    if (!user) {
      return setErrorMessage('Please Login with Discord');
    }
    if (amount == 0) {
      return setErrorMessage('Yeah, just upload nothing. Good idea indeed');
    }

    if (useSportStore.getState().currentSport.sport == null) {
      return setErrorMessage(
        `What? Should I upload ${amount} apples? Perhaps oranges?`
      );
    }
    const startTime = new Date().getTime();
    setSnackbarState('uploading');
    try {
      const sport = new SportRow(
        currentSport.sport!,
        currentSport.game!,
        computedValue
      );
      console.timeLog(`Upload Sport: ${sport.toJson()}`);
      const fut = await sport.upload();
      const data = await fut.json();

      // wait artificially 1s, for upload animation
      // Calculate elapsed time in milliseconds.
      const elapsedTime = new Date().getTime() - startTime;
      const minimumDuration = 1000;

      // Wait for the rest of the minimum duration if necessary.
      if (elapsedTime < minimumDuration) {
        const remainingTime = minimumDuration - elapsedTime;
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      if (fut.ok) {
        setSnackbarState('uploaded');
        const parsed_data: { message?: string; results?: SportScore[] } = data;

        if (parsed_data.results) {
          // data.results is now an array of SportAmount
          console.log(data.results);
          setAmounts(parsed_data.results);
          // TODO: this also triggers timeline to update
          // recent activities. make better with websocket
          triggerScoreRefresh();
          setDeathAmount(0);
        }
      } else {
        setSnackbarState('failed');
      }
    } catch (error) {
      setSnackbarState('failed');
      //setErrorMessage("Any Error")
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
  const DURATION = amount !== 0 ? Math.max(40 - amount ** 1.5, 8) : 0;
  if (isMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          justifyItems: 'center',
          alignItems: 'stretch',

          height: '60%',
          flexGrow: 1,
        }}
      >
        <AnimatedButton onClick={OnUploadClick} duration={DURATION}>
          <SendIcon></SendIcon>
        </AnimatedButton>
      </Box>
    );
  }
  return (
    <Box>
      <AnimatedButton onClick={OnUploadClick} duration={DURATION}>
        <Box
          sx={{
            px: 5,
            py: 2,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: '3vh' }} fontWeight="bold">
            Upload
          </Typography>
          <SendIcon></SendIcon>
        </Box>
      </AnimatedButton>
      <Snackbar
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
      />
    </Box>
  );
};
