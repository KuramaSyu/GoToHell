import { Box, darken, Stack, Typography } from '@mui/material';
import { useSportStore } from '../../../useSportStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { useDeathAmountStore } from '../NumberSlider';
import { blendWithContrast } from '../../../utils/blendWithContrast';

/**
 * Component to display death amount, theme and sport
 */
export const SelectionOverview: React.FC = () => {
  const { amount } = useDeathAmountStore();
  const { theme } = useThemeStore();
  const { currentSport } = useSportStore();

  return (
    <Stack direction="row" width={'100%'} justifyContent="space-around" mb={2}>
      <TitleValuePill title="Theme" value={theme.custom.themeName} />
      <TitleValuePill title="Sport" value={currentSport.sport || 'Not set'} />
      <TitleValuePill title="Amount" value={amount.toString()} />
    </Stack>
  );
};

export interface TitleValuePills {
  title: string;
  value: string;
}
export const TitleValuePill: React.FC<TitleValuePills> = ({ title, value }) => {
  const { theme } = useThemeStore();
  return (
    <Stack
      sx={{
        backgroundColor: darken(theme.palette.muted.main, 0.2),
        pl: 1,
        borderRadius: theme.shape.borderRadius,
        alignItems: 'center',
        gap: 1,
        color: theme.palette.text.primary,
      }}
      direction={'row'}
    >
      <Typography textTransform={'capitalize'}>{title}</Typography>
      <Box
        sx={{
          zIndex: 2,
          borderRadius: theme.shape.borderRadius,
          background: theme.palette.muted.main,
          p: 1,
        }}
      >
        {value}
      </Box>
    </Stack>
  );
};
