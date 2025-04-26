import { useState, useEffect, ReactElement, useRef } from 'react';
import { alpha, Box, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { formatDistanceToNow } from 'date-fns';
import { useUserStore, useUsersStore } from '../../userStore';
import { BACKEND_BASE } from '../../statics';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { TransitionGroup } from 'react-transition-group';
import { motion, AnimatePresence } from 'framer-motion';
import { SportCard, SportCardNumber } from './SportCard';
import { before } from 'node:test';
import { UserApi } from '../../utils/api/Api';

export interface Sport {
  id: number;
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
}

interface SportsApiResponse {
  data: Sport[];
}

export const SportsTimeline = () => {
  const [data, setData] = useState<SportsApiResponse | null>(null);
  const { user } = useUserStore();
  const { users, addUser } = useUsersStore();
  const { theme } = useThemeStore();
  const { refreshTrigger: ScoreRefreshTrigger } = useTotalScoreStore();
  const { refreshTrigger: RecentSportsRefreshTrigger } = useRecentSportsStore();

  // hook for fetching sports
  useEffect(() => {
    if (!user) return;

    const fetchSports = async () => {
      // Include both the current user and others from the store.
      const userIds: string[] = [
        ...Object.values(users).map((u) => u.id), // friends
        user.id, // self
      ];
      const fetchedData = await new UserApi().fetchRecentSports(userIds, 50);
      if (fetchedData === null) return;
      setData(fetchedData);
    };

    // call once directly
    fetchSports();
    // TODO: totally unefficient; should use websockets
    // call every 30 seconds
    const interval = setInterval(fetchSports, 30000);

    // cleanup
    return () => clearInterval(interval);
  }, [users, user, ScoreRefreshTrigger, RecentSportsRefreshTrigger]);

  if (!user) return <Box />;
  if (!data) return <Typography>Loading Timeline</Typography>;

  const timelineItems: ReactElement[] = data.data.map((sport) => {
    const sportUser = users[sport.user_id];
    return (
      <motion.div
        key={sport.id}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: [0.7, 1.2, 1] }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <TimelineItem key={sport.id}>
          <TimelineOppositeContent sx={{ overflow: 'hidden' }}>
            <SportCardNumber data={sport}></SportCardNumber>
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
                src={sportUser?.getAvatarUrl()}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <SportCard data={sport} />
          </TimelineContent>
        </TimelineItem>
      </motion.div>
    );
  });

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        width: 'auto',
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      <TransitionGroup component={Timeline}>
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
          <AnimatePresence>{timelineItems.reverse()}</AnimatePresence>
        </Timeline>
      </TransitionGroup>
    </Box>
  );
};
