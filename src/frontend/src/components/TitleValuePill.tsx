import { Box, darken, Stack, Typography } from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';

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
