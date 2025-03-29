import { useState, useEffect, ReactElement } from 'react';
import { alpha, Box, Card, Typography } from '@mui/material';
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
import { Sport } from './Timeline';

interface SportCardProps {
  data: Sport;
}

export const SportCard: React.FC<SportCardProps> = ({ data }) => {
  const { users } = useUsersStore();
  const sportUser = users[data.user_id];
  return (
    <Card
      sx={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        m: 1,
        width: '100%',
        borderRadius: '8px',
      }}
    >
      <Box sx={{ px: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{data.amount}</Typography>
          <Typography
            variant="body1"
            component="span"
            sx={{ fontWeight: '300', textTransform: 'uppercase' }}
          >
            {data.kind}
          </Typography>
        </Box>
        {/* <Typography>{sportUser?.username || 'Unknown User'}</Typography> */}
      </Box>
      <Box sx={{ width: '100%', px: 2 }}>
        <Typography variant="subtitle2" fontWeight={300}>
          {' '}
          {formatDistanceToNow(new Date(data.timedate), {
            addSuffix: true,
          })}
        </Typography>
      </Box>
    </Card>
  );
};
