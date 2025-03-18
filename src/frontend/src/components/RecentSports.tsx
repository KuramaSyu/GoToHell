import { Box, Typography, Slider, useTheme, Button } from '@mui/material';
import { create } from 'zustand';
import { Add, Remove } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { BACKEND_BASE } from '../statics';
import { stringify } from 'querystring';
import { useUserStore } from '../userStore';

interface SportsApiResponse {
  data: any;
}

export const RecentSports = () => {
  const [data, setData] = useState<SportsApiResponse | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUserStore();

  useEffect(() => {
    if (user === null) {
      return;
    }
    const fetchResponse = async () => {
      var url = new URL(`${BACKEND_BASE}/api/sports`);
      url.searchParams.append('user_id', user!.id);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get /api/sports');
      }
      const data: SportsApiResponse = await response.json();
      setData(data);
      setLoading(false);
    };
    fetchResponse();
  }, [user]);
  if (loading == true) {
    return <Typography> Loading History</Typography>;
  }
  return <Typography>Data: {JSON.stringify(data)}</Typography>;
};
