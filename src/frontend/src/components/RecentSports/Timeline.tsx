import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useUserStore, useUsersStore } from '../../userStore';
import { BACKEND_BASE } from '../../statics';
import { formatDistanceToNow } from 'date-fns';

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

export const RecentSportsTimeline = () => {
  const [data, setData] = useState<SportsApiResponse | null>(null);
  const { user } = useUserStore();
  const { users } = useUsersStore();

  useEffect(() => {
    if (!user) return;
    const fetchResponse = async () => {
      const url = new URL(`${BACKEND_BASE}/api/sports`);
      const userIds: string[] = [];
      // Convert the users record to an array.
      userIds.push(...Object.values(users).map((u) => u.id));
      // Always add the current user's id.
      userIds.push(user.id);
      url.searchParams.append('user_ids', userIds.join(','));
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch /api/sports');
      }
      const fetchedData: SportsApiResponse = await response.json();
      // Sort records ascending by time.
      fetchedData.data.sort(
        (a, b) =>
          new Date(a.timedate).getTime() - new Date(b.timedate).getTime()
      );
      setData(fetchedData);
    };
    fetchResponse();
  }, [user, users]);

  if (!user) return <Box></Box>;
  if (!data) return <Typography>Loading Timeline</Typography>;

  // For demonstration, alternate entries into two rows.
  const topRow = data.data.filter((_, i) => i % 2 === 0);
  const bottomRow = data.data.filter((_, i) => i % 2 !== 0);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Timeline View
      </Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Top Row */}
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2 }}>
          {topRow.map((sport) => (
            <Box
              key={sport.id}
              sx={{
                p: 1,
                m: 1,
                border: '1px solid',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2">{sport.kind}</Typography>
              <Typography variant="caption">
                {formatDistanceToNow(new Date(sport.timedate))}
              </Typography>
            </Box>
          ))}
        </Box>
        {/* Horizontal timeline indicator */}
        <Box
          sx={{
            width: '100%',
            height: '2px',
            backgroundColor: 'grey.500',
            mb: 2,
          }}
        />
        {/* Bottom Row */}
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          {bottomRow.map((sport) => (
            <Box
              key={sport.id}
              sx={{
                p: 1,
                m: 1,
                border: '1px solid',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2">{sport.kind}</Typography>
              <Typography variant="caption">
                {formatDistanceToNow(new Date(sport.timedate))}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
