import { Box, Divider, Typography } from '@mui/material';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { animated, config, useTransition } from 'react-spring';
import { useUsersStore, useUserStore } from '../../../userStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../../utils/api/ApiRequirementsBuilder';
import { DiscordUserImpl } from '../../../components/DiscordLogin';
import { StreakNumberCircle } from './StreakCard';
import { useThemeStore } from '../../../zustand/useThemeStore';

const AnimatedBox = animated(Box);

export const StreakTimeline: React.FC = () => {
  const { users } = useUsersStore();
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);
  const usersSorted: DiscordUserImpl[] = useMemo(() => {
    if (isLoading || user === null) return [];
    var allUsers = [
      user,
      ...Object.values(users).filter((u) => u.id !== user.id),
    ];
    allUsers.sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0));
    return allUsers;
  }, [isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.Friends)
        .add(ApiRequirement.AllStreaks)
        .fetchIfNeeded();
    };
    fetchData().finally(() => setIsLoading(false));
  }, []);
  const transition = useTransition(usersSorted, {
    key: (user) => user.id,
    from: { opacity: 0, y: 20, scale: 0.3 },
    enter: { opacity: 1, y: 0, scale: 1 },
    leave: { opacity: 0, y: 20, scale: 0.3 },
    config: config.default,
    trail: 80,
  });

  const timelineItems: ReactElement[] = transition((style, user) => {
    return (
      <Box sx={{ ml: 1, mb: 2 }}>
        <StreakNumberCircle style={style} user={user} />
      </Box>
    );
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        sx={{
          height: 1 / 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          textTransform: 'uppercase',
        }}
      >
        <Box>
          <Typography variant={'h6'}>Current Streaks</Typography>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Divider></Divider>
        </Box>
      </Box>

      {timelineItems}
    </Box>
  );
};
