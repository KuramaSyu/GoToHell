import { alpha, Box, Button } from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';
import React from 'react';

export interface QuickActionEntryProps {
  title: string;
  keys: string;
  icon: React.ReactNode;
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
  navigateToPage: string;
}

export const QuickActionEntry: React.FC<QuickActionEntryProps> = ({
  title,
  keys,
  icon,
  page,
  setPage,
  navigateToPage,
}) => {
  const { theme } = useThemeStore();
  return (
    <Button
      onClick={() => {
        if (page !== navigateToPage) {
          setPage(navigateToPage);
        }
      }}
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 5,
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ fontSize: '2.5vh', whiteSpace: 'nowrap', color: 'white' }}>
            {title}
          </Box>
          <Box
            sx={{ fontSize: '1.8 vh', whiteSpace: 'nowrap', color: 'white' }}
          >
            {keys}
          </Box>
        </Box>
      </Box>
    </Button>
  );
};

export const ICON_QICK_ACTION_SX = {
  height: '6vh',
  width: 'auto',
  alignContent: 'center',
};
