import { useEffect, useState } from 'react';

import { useUserStore } from '../userStore';
import { Box, Button } from '@mui/material';
import { BACKEND_BASE, NUMBER_FONT } from '../statics';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface StreakData {
  days: number;
  user_id: string;
}
export const Streak = () => {
  const { user } = useUserStore();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        return;
      }
      const resp = await fetch(`${BACKEND_BASE}/api/sports/streak/${user.id}`, {
        credentials: 'include',
        method: 'GET',
      });
      if (resp.ok) {
        // mapping from data: StreakData
        const json = await resp.json();
        console.log('/api/sports/streaks:', json);
        const answ = json['data'] as StreakData;
        setStreak(answ.days);
      } else {
        console.error('Failed to fetch streak data:', resp.statusText);
      }
    };
    fetchData();
  }, [user]);

  if (!user || streak === null) {
    return null;
  }

  return (
    <Button variant="outlined" color="primary" sx={{ fontFamily: NUMBER_FONT }}>
      <LocalFireDepartmentIcon sx={{ mr: 1 }} />
      {streak}
    </Button>
  );
};
