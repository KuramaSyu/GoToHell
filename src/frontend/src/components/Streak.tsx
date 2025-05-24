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
import { PopNumber } from './GameSelect';
import { Sport } from '../models/Sport';

export const Streak = () => {
  const [lastUpdated, setLastUpdated] = useState<String | null>(null);
  const { user } = useUserStore();
  const { streak } = useStreakStore();
  const { theme } = useThemeStore();
  const { recentSports } = useRecentSportsStore();
  const [usersLastSport, setUsersLastSport] = useState<Sport | null>(null);
  const today = new Date();
  const today_stripped = today.toISOString().split('T')[0]!; // YYYY-MM-DD

  // keep track of the users last sport
  useEffect(() => {
    if (!user || !recentSports) return;
    // find the last sport of the user
    const lastUserSport = recentSports.data
      .filter((d) => d.user_id === user.id)
      .pop();
    if (
      lastUserSport !== undefined &&
      lastUserSport !== null &&
      lastUserSport.id !== usersLastSport?.id
    ) {
      // the last entry is actually new
      setUsersLastSport(lastUserSport!);
    }
  }, [user, recentSports]);

  // when the users last sport changes, maybe update streak
  useEffect(() => {
    if (!user || !usersLastSport) return;
    if (lastUpdated === null || lastUpdated !== today_stripped) {
      // there was no last update, or it was not today -> fetch streak
      var resp = new UserApi().fetchStreak();

      resp
        // fetch streak from backend
        .then((answ) => {
          console.log(`Updated Streak ${useStreakStore.getState().streak}`);
          console.log(`Streak fetch response: `, JSON.stringify(answ));
          // get the date from the users latest exercise
          const latest_date = new Date(usersLastSport?.timedate ?? 0)
            .toISOString()
            .split('T')[0]!;

          // set this date as last updated
          setLastUpdated(latest_date);
          return;
        })
        .catch((err) => {
          console.error('Error fetching streak:', err);
        });
    }
  }, [user, usersLastSport]);

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
        sx={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))' }}
      >
        <PopNumber
          damping={50}
          font={NUMBER_FONT}
          mass={20}
          stiffness={40}
          value={streak ?? 0}
          fontsize="1.5rem"
        ></PopNumber>
        {/* {streak} */}
      </Typography>
    </Box>
  );
};
