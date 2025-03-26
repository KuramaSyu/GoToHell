import { useState, useEffect, ReactElement } from 'react';
import { alpha, Box, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { formatDistanceToNow } from 'date-fns';
import { useUserStore, useUsersStore } from '../../userStore';
import { BACKEND_BASE } from '../../statics';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { TransitionGroup } from 'react-transition-group';
import { motion, AnimatePresence } from 'framer-motion';

interface Sport {
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

export const HorizontalSportsTimeline = () => {
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
      const url = new URL(`${BACKEND_BASE}/api/sports`);
      // Include both the current user and others from the store.
      const userIds: string[] = [
        ...Object.values(users).map((u) => u.id),
        user.id,
      ];
      url.searchParams.append('user_ids', userIds.join(','));
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch /api/sports');
      }
      const fetchedData: SportsApiResponse = await response.json();
      // Sort sports by time (ascending)
      fetchedData.data.sort(
        (a, b) =>
          new Date(a.timedate).getTime() - new Date(b.timedate).getTime()
      );
      setData(fetchedData);
    };

    // call once directly
    fetchSports();
    // TODO: totally unefficient; should use websockets
    // call every 30 seconds
    const interval = setInterval(fetchSports, 30000);

    // cleanup
    return () => clearInterval(interval);
  }, [user, users, ScoreRefreshTrigger, RecentSportsRefreshTrigger]);

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
          <TimelineOppositeContent
            sx={{ m: 'auto 0' }}
            align="right"
            variant="body2"
            color="text.secondary"
          >
            {formatDistanceToNow(new Date(sport.timedate), {
              addSuffix: true,
            })}
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
            <Typography
              variant="body1"
              component="span"
              sx={{ fontWeight: '300', textTransform: 'uppercase' }}
            >
              {sport.kind}
            </Typography>
            <Typography>{sportUser?.username || 'Unknown User'}</Typography>
            <Typography>{sport.amount}</Typography>
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
      }}
    >
      <TransitionGroup component={Timeline}>
        <Timeline position="left">
          <AnimatePresence>{timelineItems.reverse()}</AnimatePresence>
        </Timeline>
      </TransitionGroup>
    </Box>
  );
};
