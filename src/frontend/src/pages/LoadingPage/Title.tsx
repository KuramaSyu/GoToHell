import { Box, Typography } from '@mui/material';
import { CustomTheme } from '../../theme/customTheme';
import { NUMBER_FONT } from '../../statics';

export interface TitleProps {
  theme: CustomTheme;
}

export const Title: React.FC<TitleProps> = ({ theme }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        fontFamily: NUMBER_FONT,
      }}
    >
      <Typography
        variant="h1"
        style={{ color: theme.palette.primary.main, fontFamily: 'inherit' }}
      >
        Go{' '}
      </Typography>
      <Typography
        variant="h1"
        style={{ color: theme.palette.secondary.main, fontFamily: 'inherit' }}
      >
        To{' '}
      </Typography>
      <Typography
        variant="h1"
        style={{ color: theme.palette.primary.main, fontFamily: 'inherit' }}
      >
        Hell
      </Typography>
    </Box>
  );
};
