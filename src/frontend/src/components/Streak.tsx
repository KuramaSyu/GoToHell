import { useEffect, useState } from 'react';

import { useUserStore } from '../userStore';
import { Box, Typography } from '@mui/material';
import { BACKEND_BASE, NUMBER_FONT } from '../statics';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useThemeStore } from '../zustand/useThemeStore';
import { useStreakStore } from '../zustand/StreakStore';
import { StreakData } from '../models/Streak';
import { UserApi } from '../utils/api/Api';

export const Streak = () => {
  const { user } = useUserStore();
  const { streak } = useStreakStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    new UserApi().fetchStreak();
  }, [user]);

  if (!user || streak === null) {
    return null;
  }

  return (
    <Box
      sx={{
        filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.5))', // Apply drop shadow here

        fontFamily: NUMBER_FONT,
        color: theme.palette.primary.main,
        width: '100%',
        height: '100%',
        transform: 'scale(2)',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <LocalFireDepartmentIcon sx={{ mr: 1 }} />
      <Typography
        fontSize={'1.2rem'}
        sx={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
      >
        {streak}
      </Typography>
    </Box>
  );
};
