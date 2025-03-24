import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
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

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Timeline View
      </Typography>
      <Timeline
        position="alternate"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          p: 0,
          '& .MuiTimelineItem-root': { flex: 1 },
        }}
      >
        {data.data.map((sport, index) => {
          const sportUser =
            sport.user_id === user.id ? user : users[sport.user_id];
          return (
            <TimelineItem key={sport.id}>
              <TimelineOppositeContent
                sx={{
                  p: 1,
                  textAlign: 'center',
                  alignSelf: index % 2 === 0 ? 'flex-start' : 'flex-end',
                }}
                variant="body2"
                color="text.secondary"
              >
                {formatDistanceToNow(new Date(sport.timedate))} ago
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot>
                  <img
                    src={sportIconMap[sport.kind]}
                    alt={sport.kind}
                    style={{ width: 24, height: 24 }}
                  />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: 1, px: 2, textAlign: 'center' }}>
                <Typography variant="h6" component="span">
                  {sport.amount}
                </Typography>
                {sportUser?.getAvatarUrl && (
                  <img
                    src={sportUser.getAvatarUrl()}
                    alt="User Avatar"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      marginLeft: 8,
                    }}
                  />
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
};
