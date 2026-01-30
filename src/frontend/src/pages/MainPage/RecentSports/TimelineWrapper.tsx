import { Box, LinearProgress } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StreakTimeline } from './StreakTimeline';
import { SportsTimeline } from './Timeline';
import { DurationCalculator } from '../../../utils/durationCalculator';
import { useThemeStore } from '../../../zustand/useThemeStore';

const TOTAL_DURATION_MS = 5000;
const WITHIN_X_STEPS = 15;

interface ProgressState {
  startTime: number;
  currentProgress: number;
  isCompleted: boolean;
}

const MemoStreakTimeline = memo(StreakTimeline);

export const TimelineWrapper: React.FC = () => {
  // progress from 0 to 100
  const [progress, setProgress] = useState(
    new DurationCalculator(TOTAL_DURATION_MS, WITHIN_X_STEPS),
  );
  const [progressCompleted, setProgressCompleted] = useState(false);

  const timerRef = useRef<number | null>(null);

  // perf: function to set duration progress
  const updateProgress = useCallback(() => {
    setProgress((prevProgress) => {
      if (prevProgress.is_completed()) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return prevProgress;
      }

      // Clone object to get a new reference,
      // so React detects the state change
      const newProgress = Object.assign(
        Object.create(Object.getPrototypeOf(prevProgress)),
        prevProgress,
      );
      // actually increment step
      newProgress.next_step();
      return newProgress;
    });
  }, []);

  // constant ticking timer to make a smooth
  // progress animation to show, when history
  // timeline will be displayed instead of streak display
  useEffect(() => {
    if (progress.is_completed()) return;

    // clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Memoized step interval calculation
    const stepInterval = progress.get_step_ms();

    // Start new timer
    timerRef.current = window.setInterval(() => {
      updateProgress();
    }, stepInterval);

    // cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = 0;
      }
    };
  }, [updateProgress, progress.is_completed()]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // set ProgressCompleted to true after a delay, to
  // fully display animation
  useEffect(() => {
    if (!progress.is_completed()) return;

    const timeout = setTimeout(() => {
      setProgressCompleted(true);
    }, useThemeStore.getState().theme.transitions.duration.standard); // match MUI transition

    return () => clearTimeout(timeout);
  }, [progress.is_completed()]);

  return (
    <Box>
      {!progressCompleted ? (
        <Box>
          <LinearProgress
            variant='determinate'
            value={progress.current_step.get_percentage()}
            sx={{ height: 10 }}
          />
          <MemoStreakTimeline />
        </Box>
      ) : (
        <SportsTimeline></SportsTimeline>
      )}
    </Box>
  );
};
