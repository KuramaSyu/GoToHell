import React, { useState, useEffect, use } from 'react';
import {
  Snackbar,
  Alert,
  Typography,
  Button,
  Box,
  LinearProgress,
} from '@mui/material';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { set } from 'zod';

const InfoDisplay: React.FC = () => {
  const { Message } = useInfoStore();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const INTERVAL = 100;
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (open) {
      const steps = Message.getDurationMs() / INTERVAL;
      const increment = 100 / steps;

      // timer which increases
      const timer = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(timer);
            window.setTimeout(() => {
              // this delay is used, that the loading bar
              // actually reaches the end due to animations
              setOpen(false);
            }, INTERVAL * 3);
            return 100;
          }
          return next;
        });
      }, INTERVAL);
      // close when timer is done

      return () => clearInterval(timer);
    }
  }, [open, Message]);

  // Monitor error message changes
  useEffect(() => {
    if (Message && Message.message !== '') {
      setOpen(true);
    }
  }, [Message]);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      key={Message.message} // This key is important for re-triggering with the same message
      //slotProps={{ transition: { onExited: handleExited } }}
      sx={{ zIndex: 9999 }}
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
