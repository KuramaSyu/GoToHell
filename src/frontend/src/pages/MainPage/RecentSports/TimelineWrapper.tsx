import { Box, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { StreakTimeline } from './StreakTimeline';
import { SportsTimeline } from './Timeline';

export const TimelineWrapper: React.FC = () => {
  // progress from 0 to 100
  const [progress, setProgress] = useState(0);

  // constant ticking timer to make a smooth
  // progress animation to show, when history
  // timeline will be displayed instead of streak display
  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    // timer which increases
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);
  return (
    <Box>
      {progress < 100 ? (
        <Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10 }}
          ></LinearProgress>
          <StreakTimeline></StreakTimeline>
        </Box>
      ) : (
        <SportsTimeline></SportsTimeline>
      )}
    </Box>
  );
};
