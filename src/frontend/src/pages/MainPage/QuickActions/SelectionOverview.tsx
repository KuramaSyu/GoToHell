import { Box, darken, Stack, Typography } from '@mui/material';
import { useSportStore } from '../../../useSportStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { useDeathAmountStore } from '../NumberSlider';
import { blendWithContrast } from '../../../utils/blendWithContrast';
import { TitleValuePill } from '../../../components/TitleValuePill';

/**
 * Component to display death amount, theme and sport
 */
export const SelectionOverview: React.FC = () => {
  const { amount } = useDeathAmountStore();
  const { theme } = useThemeStore();
  const { currentSport } = useSportStore();

  return (
    <Stack direction="row" width={'100%'} justifyContent="space-evenly" mb={2}>
      <TitleValuePill title="Theme" value={theme.custom.themeName} />
      <TitleValuePill title="Sport" value={currentSport.sport || 'Not set'} />
      <TitleValuePill title="Amount" value={amount.toString()} />
    </Stack>
  );
};
