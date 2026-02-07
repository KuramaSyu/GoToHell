import { useEffect, useState } from 'react';

import { useUserStore } from '../userStore';
import { Box, Tooltip, Typography } from '@mui/material';
import { NUMBER_FONT } from '../statics';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useThemeStore } from '../zustand/useThemeStore';
import { useStreakStore } from '../zustand/StreakStore';
import { useRecentSportsStore } from '../zustand/RecentSportsState';
import { Sport } from '../models/Sport';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../utils/api/ApiRequirementsBuilder';
import { PopNumber } from '../pages/MainPage/PopNumber';

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
      const fetchStreak = async () => {
        // fetch streak from backend
        await new ApiRequirementsBuilder()
          .add(ApiRequirement.User)
          .fetchIfNeeded();

        await new ApiRequirementsBuilder()
          .add(ApiRequirement.Streak)
          .forceFetch();

        const resp = useStreakStore.getState().streak;
        if (resp === null) {
          console.error('Error fetching streak');
          return;
        }

        console.log(`Updated Streak ${resp}`);
        // get the date from the users latest exercise
        const latest_date = new Date(usersLastSport?.timedate ?? 0)
          .toISOString()
          .split('T')[0]!;

        // set this date as last updated
        setLastUpdated(latest_date);
        return;
      };
      fetchStreak();
    }
  }, [user, usersLastSport]);

  return (
    <Tooltip title={`You have done sport ${streak} days in a row`} arrow>
      <Box
        sx={{
          fontFamily: NUMBER_FONT,
          color: theme.palette.primary.light,
          width: '100%',
          height: '100%',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          fontSize: theme.typography.h3,
        }}
      >
        <LocalFireDepartmentIcon
          fontSize='inherit'
          sx={{ mr: 1, transition: theme.colorTransition.root.transition }}
        />
        <Typography>
          <PopNumber
            damping={50}
            mass={20}
            stiffness={40}
            value={streak ?? 0}
            fontsize={undefined}
            typographyVariant='h3'
            style={{
              fontWeight: 200,
            }}
          ></PopNumber>
        </Typography>
      </Box>
    </Tooltip>
  );
};
