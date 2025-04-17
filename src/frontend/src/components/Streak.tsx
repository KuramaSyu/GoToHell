import { useEffect, useState } from 'react';

import { useUserStore } from '../userStore';
import { Box, Typography } from '@mui/material';
import { BACKEND_BASE, NUMBER_FONT } from '../statics';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useThemeStore } from '../zustand/useThemeStore';
import { useStreakStore } from '../zustand/StreakStore';
import { StreakData } from '../models/Streak';
import { UserApi } from '../utils/api/Api';
import { useRecentSportsStore } from '../zustand/RecentSportsState';

export const Streak = () => {
  const [lastUpdated, setLastUpdated] = useState<String | null>(null);
  const { user } = useUserStore();
  const { streak } = useStreakStore();
  const { theme } = useThemeStore();
  const { recentSports } = useRecentSportsStore();
  const today = new Date();
  const today_stripped = today.toISOString().split('T')[0]!; // YYYY-MM-DD

  useEffect(() => {
    if (lastUpdated === null || lastUpdated !== today_stripped) {
      var resp = new UserApi().fetchStreak();

      // get latest date in recentSports
      const latest_date = new Date(
        recentSports?.data[recentSports!.data.length - 1]?.timedate ?? 0
      )
        .toISOString()
        .split('T')[0]!;

      // update if fetch was successfull
      resp.then((answ) => {
        if (answ == null) {
          return;
        }
        setLastUpdated(latest_date);
      });
    }
  }, [user, recentSports]);

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
