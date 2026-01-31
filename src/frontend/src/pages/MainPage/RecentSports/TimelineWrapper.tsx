import { Box, LinearProgress, Theme } from '@mui/material';
import { ResponsiveStyleValue } from '@mui/system';
import React, { memo, useEffect, useState } from 'react';
import { StreakTimeline } from './StreakTimeline';
import { SportsTimeline } from './Timeline';

const TOTAL_DURATION_MS = 5000;
const MemoStreakTimeline = memo(StreakTimeline);

export const TimelineWrapper: React.FC = () => {
  // is set after 5s
  const [progressCompleted, setProgressCompleted] = useState(false);

  // and start 5 second timer to set progressCompleted to true
  useEffect(() => {
    // Start new timer
    var timer = window.setInterval(() => {
      setProgressCompleted(true);
    }, TOTAL_DURATION_MS);

    // cleanup
    return () => clearInterval(timer);
  }, []);

  return (
    <Box>
      {!progressCompleted ? (
        <Box>
          <SimpleTimeBasedProgressBar durationMs={TOTAL_DURATION_MS} />
          <MemoStreakTimeline />
        </Box>
      ) : (
        <SportsTimeline></SportsTimeline>
      )}
    </Box>
  );
};

export interface SimpleTimeBasedProgressBarProps {
  durationMs: number;
  barColor?:
    | ResponsiveStyleValue<string>
    | ((theme: Theme) => ResponsiveStyleValue<string>)
    | null;
}

/**
 * Makes a simple progress bar from 0% width to 100% width
 * over the given duration in milliseconds
 * @param durationMs Duration in milliseconds
 * @param backgroundColor Background color of the progress bar
 */
export const SimpleTimeBasedProgressBar: React.FC<
  SimpleTimeBasedProgressBarProps
> = ({ durationMs, barColor }) => {
  return (
    <Box
      sx={{
        height: 12,
        width: '0%',
        backgroundColor: barColor ?? 'primary.main',
        animation: `progressBar ${durationMs}ms linear forwards`,
        '@keyframes progressBar': {
          to: { width: '100%' },
        },
      }}
    ></Box>
  );
};
