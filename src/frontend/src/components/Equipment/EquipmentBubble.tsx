import { useEffect } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEquipmentStore } from '../../zustand/EquipmentStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import {
  formatMeters,
  getEquipmentConfig,
  getUsagePercentage,
} from '../../utils/data/Equipment';
import { useThemeStore } from '../../zustand/useThemeStore';

interface EquipmentBubbleProps {
  sport: string;
  onOpenSettings: () => void;
}

/**
 * Popover content for the equipment pill. Shows the usage of every piece of
 * equipment for the current sport and opens the management modal.
 */
export const EquipmentBubble: React.FC<EquipmentBubbleProps> = ({
  sport,
  onOpenSettings,
}) => {
  const { theme } = useThemeStore();
  const { equipment, loaded } = useEquipmentStore();
  const config = getEquipmentConfig(sport);

  useEffect(() => {
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserEquipment)
      .fetchIfNeeded();
  }, [loaded]);

  return (
    <>
      <Paper
        sx={{ py: 2, px: 2, width: 'clamp(400px, 33vw, 700px)' }}
        elevation={24}
      >
        <Stack direction='column' gap={2} alignItems='center' width='100%'>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            width='100%'
          >
            <Typography variant='h5' textTransform='uppercase'>
              {config?.label ?? 'Equipment'}
            </Typography>
            <Tooltip title='Manage equipment' arrow>
              <IconButton
                aria-label='manage equipment'
                onClick={onOpenSettings}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {equipment.length > 0 ? (
            equipment.map((item) => {
              const percentage = getUsagePercentage(item);
              const progress = percentage === null ? 0 : Math.min(percentage, 100);
              return (
                <Paper
                  key={item.id}
                  elevation={10}
                  sx={{
                    py: 1,
                    px: 2,
                    background: `linear-gradient(to right, ${theme.palette.secondary.main} ${progress}%, ${theme.palette.background.paper} ${progress}%)`,
                    borderRadius: theme.shape.borderRadius,
                    width: '100%',
                  }}
                >
                  <Stack
                    direction='column'
                    gap={0.5}
                    alignItems='flex-start'
                    width='100%'
                  >
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      width='100%'
                    >
                      <Typography variant='h6'>{item.name}</Typography>
                      <Typography variant='body1'>
                        {percentage !== null
                          ? `${Math.round(percentage)}%`
                          : 'no expected usage'}
                      </Typography>
                    </Stack>
                    {item.description && (
                      <Typography variant='body2' color='text.secondary'>
                        {item.description}
                      </Typography>
                    )}
                    <Typography variant='body1'>
                      {formatMeters(item.current_usage_meters)}
                      {item.expected_usage
                        ? ` / ${formatMeters(item.expected_usage)}`
                        : ' used'}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h6'>
                {loaded
                  ? `Seems like you haven't added any ${config?.label.toLowerCase() ?? 'equipment'} yet.`
                  : 'Loading equipment...'}
              </Typography>
              <Typography variant='body1'>
                Open the settings in the top right to add your equipment.
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </>
  );
};

export default EquipmentBubble;
