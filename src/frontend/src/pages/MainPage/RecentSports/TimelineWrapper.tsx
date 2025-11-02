import { Box, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { StreakTimeline } from './StreakTimeline';
import { SportsTimeline } from './Timeline';
import { DurationCalculator } from '../../../utils/durationCalculator';

const TOTAL_DURATION_MS = 5000;
const WITHIN_X_STEPS = 25;
export const TimelineWrapper: React.FC = () => {
  // progress from 0 to 100
  const [progress, setProgress] = useState(
    new DurationCalculator(TOTAL_DURATION_MS, WITHIN_X_STEPS)
  );

  // constant ticking timer to make a smooth
  // progress animation to show, when history
  // timeline will be displayed instead of streak display
  useEffect(() => {
    // timer which increases
    const timer = window.setInterval(() => {
      setProgress((prevProgress) => {
        if (progress.is_completed()) {
          clearInterval(timer);
          return prevProgress;
        }
        // Create a new instance to trigger a re-render
        const newProgress = Object.assign(
          Object.create(Object.getPrototypeOf(prevProgress)),
          prevProgress
        );
        newProgress.next_step();
        console.log(
          newProgress.current_step.get_percentage(),
          newProgress.is_completed()
        );
        return newProgress;
      });
    }, progress.get_step_ms());

    return () => clearInterval(timer);
  }, []);
  return (
    <Box>
      {!progress.is_completed() ? (
        <Box>
          <LinearProgress
            variant="determinate"
            value={progress.current_step.get_percentage()}
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
