import { Box, Typography } from '@mui/material';
import { CustomTheme } from '../../theme/customTheme';
import { NUMBER_FONT } from '../../statics';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface TitleProps {
  theme: CustomTheme;
}

export const Title: React.FC<TitleProps> = ({ theme }) => {
  const { isMobile } = useBreakpoint();
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
        style={{
          color: theme.palette.primary.main,
          fontFamily: 'inherit',
          fontSize: isMobile ? '5rem' : '10vh',
        }}
      >
        Go{' '}
      </Typography>
      <Typography
        style={{
          color: theme.palette.secondary.main,
          fontFamily: 'inherit',
          fontSize: isMobile ? '5rem' : '10vh',
        }}
      >
        To{' '}
      </Typography>
      <Typography
        style={{
          color: theme.palette.primary.main,
          fontFamily: 'inherit',
          fontSize: isMobile ? '5rem' : '10vh',
        }}
      >
        Hell
      </Typography>
    </Box>
  );
};
