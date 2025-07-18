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
import { BACKEND_BASE, NUMBER_FONT } from '../../statics';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { TransitionGroup } from 'react-transition-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Sport } from './Timeline';
import { DiscordUserImpl } from '../DiscordLogin';

interface StreakCardProps {
  user: DiscordUserImpl;
}

export const StreakCardNumber: React.FC<StreakCardProps> = ({ user }) => {
  return (
    <Box
      sx={{
        display: 'flex', // Enables Flexbox
        flexShrink: 0, // Prevents shrinking
        alignSelf: 'flex-start', // Ensures it doesn't stretch in the parent flex container
        borderRadius: '50%', // Makes the box a circle
        width: 65, // Set a fixed width
        height: 65, // Set the same height as the width
        background:
          'radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 85%, rgba(0,0,0,0) 100%)',
        justifyContent: 'center', // Centers content horizontally
        alignItems: 'center', // Centers content vertically
        overflow: 'hidden',
        mr: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: NUMBER_FONT,
          fontSize: '1.5rem', // Adjust font size as needed
          color: 'white', // Optional: text color for better visibility
        }}
        variant="h6"
      >
        {user.streak ?? 0}
      </Typography>
    </Box>
  );
};
