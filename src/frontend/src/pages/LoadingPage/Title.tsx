import { Box, Typography } from '@mui/material';
import { CustomTheme } from '../../theme/customTheme';
import { NUMBER_FONT } from '../../statics';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface TitleProps {
  theme: CustomTheme;
  color1?: string;
  color2?: string;
}

export const Title: React.FC<TitleProps> = ({ theme, color1, color2 }) => {
  const { isMobile } = useBreakpoint();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        // fontFamily: NUMBER_FONT,
        fontWeight: 200,
        fontSize: 'inherit',
      }}
    >
      <Typography
        style={{
          color: color1 || theme.palette.primary.light,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
        }}
      >
        Go{' '}
      </Typography>
      <Typography
        style={{
          color: color2 || theme.palette.secondary.light,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
        }}
      >
        To{' '}
      </Typography>
      <Typography
        style={{
          color: color1 || theme.palette.primary.light,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
        }}
      >
        Hell
      </Typography>
    </Box>
  );
};
