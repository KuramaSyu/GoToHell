import { useMediaQuery, useTheme } from '@mui/material';

export const useBreakpoint = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isXL = useMediaQuery(theme.breakpoints.up('xl'));
  return {
    isMobile,
    isTablet,
    isDesktop,
    isXL,
  };
};
