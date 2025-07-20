import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';
import useInfoStore from '../zustand/InfoStore';

const InfoDisplay: React.FC = () => {
  const { Message, setMessage: setErrorMessage } = useInfoStore();
  const [open, setOpen] = useState(false);

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
      }, 5000);
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
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      key={Message.message} // This key is important for re-triggering with the same message
      slotProps={{ transition: { onExited: handleExited } }}
    >
      <Typography variant="h4" component="div">
        <Alert severity={Message.severity}>{Message.message}</Alert>
      </Typography>
    </Snackbar>
  );
};

export default InfoDisplay;
