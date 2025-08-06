import React, { useState, useEffect, use } from 'react';
import {
  Snackbar,
  Alert,
  Typography,
  Button,
  Box,
  LinearProgress,
} from '@mui/material';
import useInfoStore from '../../zustand/InfoStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { set } from 'zod';

const InfoDisplay: React.FC = () => {
  const { Message, setMessage: setErrorMessage } = useInfoStore();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const DEFAULT_DURATION = 6000;
  const INTERVAL = 100;
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!open) {
      return;
    }

    const steps = (Message.duration ?? DEFAULT_DURATION) / INTERVAL;
    const increment = 100 / steps;

    // timer which increases
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          window.setTimeout(() => {
            setOpen(false);
          }, INTERVAL);
          return 100;
        }
        return next;
      });
    }, INTERVAL);
    // close when timer is done

    return () => clearInterval(timer);
  }, [open]);

  // Monitor error message changes
  useEffect(() => {
    if (Message && Message.message !== '') {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [Message]);

  // Slide animation
  // const SlideTransition = (props: SlideProps) => {
  //   return <Slide {...props} direction="down" />;
  // };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  // Handle cleanup after animation
  // useless?
  const handleExited = () => {
    // setErrorMessage({
    //   message: '',
    //   severity: 'info',
    // });
    // setProgress(0); // Reset progress bar
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={Message.duration ?? DEFAULT_DURATION}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      key={Message.message} // This key is important for re-triggering with the same message
      slotProps={{ transition: { onExited: handleExited } }}
    >
      <Typography variant="h4" component="div">
        <Alert severity={Message.severity}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {Message.message}
            <Button onClick={() => setOpen(false)}>ok</Button>
          </Box>
          <Box sx={{ width: '100%', position: 'absolute', bottom: 0, left: 0 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 4 }}
            />
          </Box>
        </Alert>
      </Typography>
    </Snackbar>
  );
};

export default InfoDisplay;
