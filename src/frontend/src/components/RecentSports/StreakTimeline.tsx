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
import { Box } from '@mui/material';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { animated, config, useTransition } from 'react-spring';
import { useUsersStore, useUserStore } from '../../userStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { DiscordUserImpl } from '../DiscordLogin';
import { StreakCardNumber } from './StreakCard';

const AnimatedBox = animated(Box);

export const StreakTimeline: React.FC = () => {
  const { users } = useUsersStore();
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const usersSorted: DiscordUserImpl[] = useMemo(() => {
    if (isLoading) return [];
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
      <AnimatedBox
        key={user.id}
        style={style}
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >
        <TimelineItem
          sx={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
        >
          <TimelineOppositeContent sx={{ overflow: 'hidden' }}>
            <StreakCardNumber user={user}></StreakCardNumber>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot
              color="primary"
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                margin: 'auto',
              }}
            >
              <img
                src={user.getAvatarUrl()}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  objectFit: 'cover',
                }}
              />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>{user.username}</TimelineContent>
        </TimelineItem>
      </AnimatedBox>
    );
  });

  return (
    <Timeline
      sx={{
        // weird CSS hack, to align the timeline dots left
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: '0 1 auto',
          //flex: 0,
          padding: 0,
          height: '100%',
          overflowY: 'auto',
        },
        [`& .${timelineItemClasses.root}:before`]: {
          padding: 0,
          margin: 0,
        },
      }}
    >
      {timelineItems}
    </Timeline>
  );
};
