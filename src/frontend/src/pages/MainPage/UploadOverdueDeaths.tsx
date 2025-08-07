import { Box, darken, Fade, lighten } from '@mui/material';
import { useSportStore } from '../../useSportStore';
import { useDeathAmountStore } from './NumberSlider';
import { useUserStore } from '../../userStore';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { AnimatedRoundBtn } from './AnimatedButton';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { UploadBuilder } from '../../utils/api/UploadBuilder';
import SnoozeIcon from '@mui/icons-material/Snooze';

type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadOverdueDeaths = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountStore();
  const { user } = useUserStore();
  const { setMessage } = useInfoStore();
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
      setMessage(new SnackbarUpdateImpl(String(e), 'error'));
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
    <Fade in={isAnimationActive} timeout={500}>
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
          <AnimatedRoundBtn
            onClick={OnUploadClick}
            duration={duration}
            circular
          >
            <Box
              sx={{
                fontSize: 'clamp(2rem, 4vh, 6rem)',
                color: isAnimationActive
                  ? lighten(theme.palette.primary.main, 2 / 3)
                  : darken(theme.palette.primary.main, 1 / 3),
              }}
            >
              <SnoozeIcon fontSize="inherit"></SnoozeIcon>
            </Box>
          </AnimatedRoundBtn>
        </Box>
      </Box>
    </Fade>
  );
};
