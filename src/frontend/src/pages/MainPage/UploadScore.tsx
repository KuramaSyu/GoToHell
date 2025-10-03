import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  CircularProgress,
  darken,
  lighten,
  Fade,
} from '@mui/material';
import { useSportStore } from '../../useSportStore';
import { useDeathAmountStore } from './NumberSlider';
import SendIcon from '@mui/icons-material/Send';
import { useUserStore } from '../../userStore';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';
import { alpha } from '@mui/material/styles';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import AnimatedButton, { AnimatedRoundBtn } from './AnimatedButton';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import useUploadStore from '../../zustand/UploadStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { UploadBuilder } from '../../utils/api/UploadBuilder';

type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadScore = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountStore();
  const { user } = useUserStore();
  const { setMessage } = useInfoStore();
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(null);
  const { setAmounts, triggerRefresh: triggerScoreRefresh } =
    useTotalScoreStore();
  const { calculator } = useCalculatorStore();
  const { uploadTrigger } = useUploadStore();
  const { isMobile } = useBreakpoint();
  const { theme } = useThemeStore();

  // for triggers coming from outside (eg shortcut modal)
  useEffect(() => {
    if (uploadTrigger === 0) return;
    OnUploadClick().finally();
  }, [uploadTrigger]);

  const OnUploadClick = async () => {
    try {
      const startTime = new Date().getTime();
      const uploadBuilder = UploadBuilder.default().setStoreUpdate(false);

      setSnackbarState('uploading');

      // set timer to wait arteficially 1s, for upload animation
      const minimumDuration = 1000;
      await uploadBuilder.upload();
      const elapsedTime = new Date().getTime() - startTime;

      // Wait for the rest of the minimum duration if necessary.
      if (elapsedTime < minimumDuration) {
        const remainingTime = minimumDuration - elapsedTime;
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      setSnackbarState('uploaded');

      uploadBuilder.uploadStrategy.updateStores();
    } catch (e) {
      // handle upload error - description is in error included
      setSnackbarState('failed');
      setMessage(
        new SnackbarUpdateImpl(`Error uploading score: ${e}`, 'error')
      );
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

  const DURATION = amount !== 0 ? Math.max(40 - amount ** 1.5, 8) : 0;
  if (isMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          justifyItems: 'center',
          alignItems: 'stretch',

          height: 'fill',
          aspectRatio: '1 / 1',
          flexGrow: 1,
          color:
            DURATION !== 0
              ? darken(theme.palette.primary.main, 0.1)
              : darken(theme.palette.primary.main, 0.3),
        }}
      >
        <AnimatedRoundBtn
          onClick={OnUploadClick}
          duration={DURATION}
          edgeFade={0}
        >
          <SendIcon sx={{ fontSize: '2rem' }}></SendIcon>
        </AnimatedRoundBtn>
      </Box>
    );
  }
  return (
    <Fade in={DURATION !== 0} timeout={500}>
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
              color:
                DURATION !== 0
                  ? lighten(theme.palette.primary.main, 2 / 3)
                  : darken(theme.palette.primary.main, 1 / 3),
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
    </Fade>
  );
};
