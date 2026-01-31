import { Box, LinearProgress } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { StreakTimeline } from './StreakTimeline';
import { SportsTimeline } from './Timeline';

const TOTAL_DURATION_MS = 5000;

const MemoStreakTimeline = memo(StreakTimeline);

export const TimelineWrapper: React.FC = () => {
  // does not actually represent the progress.
  // it instantly goes to 100, so the
  // bar starts a 5s animation from 0 -> 100
  const [progress, setProgress] = useState(0);

  // is set after 5s
  const [progressCompleted, setProgressCompleted] = useState(false);

  // on load: set progress to 100
  // and start 5 second timer to set progressCompleted to true
  useEffect(() => {
    if (progress === 100) return;

    // Start new timer
    setProgress(100);
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
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{
              height: 10,
              '& .MuiLinearProgress-bar': {
                transition: `transform ${TOTAL_DURATION_MS}ms linear`,
              },
            }}
          />
          <MemoStreakTimeline />
        </Box>
      ) : (
        <SportsTimeline></SportsTimeline>
      )}
    </Box>
  );
};
