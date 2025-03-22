import { useState } from 'react';
import { Box, Typography, Snackbar, CircularProgress } from '@mui/material';
import { useSportStore } from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from '../userStore';
import SportRow, { SportScore } from '../models/Sport';
import useAppState from '../zustand/Error';
import { alpha } from '@mui/material/styles';
import { useTotalScoreStore } from '../zustand/TotalScoreStore';
import AnimatedButton from './AnimatedButton';
import { useRecentSportsStore } from '../zustand/RecentSportsState';

type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadScore = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountState();
  const { user } = useUserStore();
  const { setErrorMessage } = useAppState();
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(null);
  const { setAmounts } = useTotalScoreStore();

  const OnUploadClick = async () => {
    if (!currentSport) {
      return setErrorMessage('Please select a Sport first');
    }

    if (amount == 0) {
      return setErrorMessage('Yeah, just upload nothing. Good idea indeed');
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
      console.log(data);
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
          useRecentSportsStore.getState().triggerRefresh();
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
  if (!(currentSport && user && currentSport.sport_multiplier && currentSport.game_multiplier)) {
    //setErrorMessage("Please Login")
    return <Box></Box>;
  }
  const computedValue = currentSport.sport_multiplier! * currentSport.game_multiplier! * amount;
  return (
    <Box>
      <AnimatedButton
        onClick={OnUploadClick}
        duration={amount !== 0 ? Math.max(40 - amount ** 1.5, 8) : 0}
      >
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
          <Typography variant="h4" fontWeight="bold">
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
