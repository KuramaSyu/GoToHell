import React, { useState, useEffect, ReactElement } from 'react';
import { Box, makeStyles, Typography } from '@mui/material';
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
import { sportIconMap } from '../SportSelect'; // using sport icons from SportSelect
import { useThemeStore } from '../../zustand/useThemeStore';

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
  const { users } = useUsersStore();
  const { theme } = useThemeStore();

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

    fetchSports();
  }, [user, users]);

  if (!user) return <Box />;
  if (!data) return <Typography>Loading Timeline</Typography>;

  var timelineItems: ReactElement[] = [];
  for (const sport of data.data) {
    const sportUser = users[sport.user_id];
    timelineItems.push(
      <TimelineItem key={sport.id} sx={{ width: '100%' }}>
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
          <Typography variant="h6" component="span">
            {sport.kind}
          </Typography>
          <Typography>{sportUser?.username || 'Unknown User'}</Typography>
          <Typography>{sport.amount}</Typography>
        </TimelineContent>
      </TimelineItem>
    );
  }
  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Timeline position="alternate">{timelineItems}</Timeline>
    </Box>
  );
};
