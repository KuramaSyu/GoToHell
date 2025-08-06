import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography, Button, Box } from '@mui/material';
import useInfoStore from '../../zustand/InfoStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const InfoDisplay: React.FC = () => {
  const { Message, setMessage: setErrorMessage } = useInfoStore();
  const [open, setOpen] = useState(false);
  const DEFAULT_DURATION = 6000;
  const { isMobile } = useBreakpoint();

  // Monitor error message changes
  useEffect(() => {
    if (Message && Message.message !== '') {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [Message]);

  // Auto hide timer
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        handleClose();
      }, Message.duration ?? DEFAULT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [open]);
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
    //setErrorMessage('');
  };

  // Handle cleanup after animation
  const handleExited = () => {
    setErrorMessage({
      message: '',
      severity: 'info',
    });
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
            sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
          >
            {Message.message}
            <Button onClick={() => setOpen(false)}>ok</Button>
          </Box>
        </Alert>
      </Typography>
    </Snackbar>
  );
};

export default InfoDisplay;
