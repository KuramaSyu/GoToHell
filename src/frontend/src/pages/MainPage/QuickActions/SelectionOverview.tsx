import { Box, Stack, Typography } from '@mui/material';
import { useSportStore } from '../../../useSportStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { useDeathAmountStore } from '../NumberSlider';

/**
 * Component to display death amount, theme and sport
 */
export const SelectionOverview: React.FC = () => {
  const { amount } = useDeathAmountStore();
  const { theme } = useThemeStore();
  const { currentSport } = useSportStore();

  return (
    <Stack direction="row" width={'100%'} justifyContent="space-around" mb={2}>
      <Box>Theme: {String(theme.custom.longName)}</Box>
      <Box>Sport: {currentSport.sport ?? 'Unknown'}</Box>
      <Box>Exercise Amount: {amount}</Box>
    </Stack>
  );
};
