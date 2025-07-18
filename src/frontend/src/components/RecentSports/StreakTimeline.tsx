import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineOppositeContent,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Divider, Typography } from '@mui/material';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { animated, config, useTransition } from 'react-spring';
import { useUsersStore, useUserStore } from '../../userStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { DiscordUserImpl } from '../DiscordLogin';
import { StreakCard, StreakCardNumber } from './StreakCard';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { useThemeStore } from '../../zustand/useThemeStore';
import { DisplaySettings } from '@mui/icons-material';

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
        <StreakCard style={style} user={user} />
      </Box>
    );
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 5,
          display: 'flex',
          justifyContent: 'center',
          textTransform: 'uppercase',
        }}
      >
        <Typography fontSize={20}>Current Streaks</Typography>
      </Box>
      <Divider sx={{ mb: 5 }}></Divider>

      {timelineItems}
    </Box>
  );
};
