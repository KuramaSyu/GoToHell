import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  darken,
  lighten,
  Fade,
  Portal,
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
import { CustomTheme } from '../../theme/customTheme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import useFeatureStore, { FeatureFlagName } from '../../zustand/FeatureStore';
import {
  getSelectedEquipment,
  useEquipmentStore,
} from '../../zustand/EquipmentStore';
import { getEquipmentConfig } from '../../utils/data/Equipment';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { EquipmentChip } from '../../components/Equipment/EquipmentChip';
type SnackbarState = 'uploading' | 'uploaded' | 'failed' | null;

export const UploadScore = () => {
  const { currentSport } = useSportStore();
  const { amount, setAmount: setDeathAmount } = useDeathAmountStore();
  const { user } = useUserStore();
  const { setMessage } = useInfoStore();
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(null);
  const { uploadTrigger } = useUploadStore();
  const { isMobile } = useBreakpoint();
  const { theme } = useThemeStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const equipmentEnabled = useFeatureStore(
    (state) => state.flags[FeatureFlagName.Equipment].isEnabled(),
  );
  const uploadConfirmationEnabled = useFeatureStore(
    (state) =>
      state.flags[FeatureFlagName.EquipmentUploadConfirmation].isEnabled(),
  );
  const selectedEquipment = useEquipmentStore((state) =>
    getSelectedEquipment(state, currentSport?.sport),
  );
  const equipment = useEquipmentStore((state) => state.equipment);
  const equipmentLoaded = useEquipmentStore((state) => state.loaded);
  const selectEquipment = useEquipmentStore((state) => state.selectEquipment);
  const equipmentConfig = getEquipmentConfig(currentSport?.sport);

  // Make sure the equipment list is available for the confirmation dialog.
  useEffect(() => {
    if (!equipmentEnabled || !equipmentConfig) return;
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserEquipment)
      .fetchIfNeeded();
  }, [equipmentEnabled, equipmentConfig, equipmentLoaded]);

  // for triggers coming from outside (eg shortcut modal)
  useEffect(() => {
    if (uploadTrigger === 0) return;
    OnUploadClick().finally();
  }, [uploadTrigger]);

  const performUpload = async () => {
    try {
      const startTime = new Date().getTime();
      const uploadBuilder = UploadBuilder.default()
        .setStoreUpdate(false)
        .setEquipmentID(selectedEquipment?.id ?? null);

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
      await uploadBuilder.maybeChangeBackgroundToNewRandom();
    } catch (e) {
      // handle upload error - description is in error included
      setSnackbarState('failed');
      setMessage(
        new SnackbarUpdateImpl(`Error uploading score: ${e}`, 'error'),
      );
    }

    setTimeout(() => setSnackbarState(null), 2000);
  };

  const OnUploadClick = async () => {
    if (
      equipmentEnabled &&
      uploadConfirmationEnabled &&
      equipmentConfig &&
      equipment.length > 0 &&
      selectedEquipment === null
    ) {
      setConfirmOpen(true);
      return;
    }
    await performUpload();
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

  const equipmentSingular = equipmentConfig?.singular ?? 'equipment';

  const confirmationDialog = (
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>
        {selectedEquipment
          ? `Upload with ${selectedEquipment.name}?`
          : `Upload without ${equipmentSingular}?`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {selectedEquipment
            ? `This upload will be added to ${selectedEquipment.name}.`
            : `This upload will not be added to any ${equipmentConfig?.label.toLowerCase() ?? 'equipment'}. Select a ${equipmentSingular} below if you want the usage to count.`}
        </DialogContentText>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <EquipmentChip
            label={`No ${equipmentSingular}`}
            selected={selectedEquipment === null}
            onClick={() => {
              if (currentSport?.sport)
                selectEquipment(currentSport.sport, null);
            }}
          />
          {equipment.map((item) => (
            <EquipmentChip
              key={item.id}
              label={item.name}
              selected={selectedEquipment?.id === item.id}
              onClick={() => {
                if (currentSport?.sport)
                  selectEquipment(currentSport.sport, item.id);
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
        <Button
          variant='contained'
          onClick={() => {
            setConfirmOpen(false);
            performUpload();
          }}
        >
          {selectedEquipment
            ? `Upload with ${selectedEquipment.name}`
            : `Upload without ${equipmentSingular}`}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            flexGrow: 1,
            color:
              DURATION !== 0
                ? darken(theme.palette.primary.main, 0.1)
                : darken(theme.palette.primary.main, 0.3),
          }}
        >
          <AnimatedButton onClick={OnUploadClick} duration={DURATION}>
            <SendIcon sx={{ fontSize: '2rem' }}></SendIcon>
          </AnimatedButton>
        </Box>
        <UploadSnackbar snackbarState={snackbarState} />
        {confirmationDialog}
      </>
    );
  }
  return (
    <>
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
              <Typography sx={{ fontSize: '3vh' }} fontWeight='bold'>
                Upload
              </Typography>
              <SendIcon></SendIcon>
            </Box>
          </AnimatedButton>
        </Box>
      </Fade>
      <UploadSnackbar snackbarState={snackbarState} />
      {confirmationDialog}
    </>
  );
};

interface UploadSnackbarProps {
  snackbarState: string | null;
}

const UploadSnackbar: React.FC<UploadSnackbarProps> = ({ snackbarState }) => {
  const { theme } = useThemeStore();
  return (
    <Portal>
      <Snackbar
        open={snackbarState != null}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: { xl: 8, m: 8, s: 0 } }} // padding to prevent clipping with top bar
        slotProps={{
          content: {
            sx: {
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              color: theme.palette.text.primary,
              fontSize: theme.typography.body1.fontSize,
            },
          },
        }}
        message={
          snackbarState === 'uploading' ? (
            <Box display='flex' alignItems='center'>
              <CircularProgress size={30} sx={{ mr: 1 }} />
              Uploading...
            </Box>
          ) : snackbarState === 'uploaded' ? (
            <Box display='flex' alignItems='center'>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 30 }} color='success' />
              Uploaded
            </Box>
          ) : snackbarState === null ? (
            ''
          ) : (
            <Box display='flex' alignItems='center'>
              <CancelIcon sx={{ mr: 1, fontSize: 30 }} color='error' />
              Failed
            </Box>
          )
        }
      />
    </Portal>
  );
};
