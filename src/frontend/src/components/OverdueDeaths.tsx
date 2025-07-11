import { alpha, Box, Typography } from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';

export const OverdueDeaths: React.FC = () => {
  const { theme } = useThemeStore();
  const contrastColor = hexToRgb(theme.palette.secondary.contrastText);
  return (
    <Box
      sx={{
        display: 'flex',
        flexShrink: 0, // Prevents shrinking
        //alignSelf: 'flex-start', // Ensures it doesn't stretch in the parent flex container
        borderRadius: '50%', // Makes the box a circle
        width: '15vh',
        height: '15vh',
        background: `radial-gradient(circle, rgba(${contrastColor},0.5) 0%, rgba(${contrastColor},0.05) 85%, rgba(${contrastColor},0) 100%)`,
        justifyContent: 'center', // Centers content horizontally
        justifyItems: 'center',
        alignItems: 'center', // Centers content vertically
        overflow: 'hidden',
        mr: 2,
      }}
    >
      <Typography>129</Typography>
    </Box>
  );
};

// Add this helper function above your component
function hexToRgb(hex: string): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('');
  }
  const num = parseInt(hex, 16);
  return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
}
