import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';
import useAppState from '../zustand/Error';

const ErrorDisplay: React.FC = () => {
  const { errorMessage, setErrorMessage } = useAppState();
  const [open, setOpen] = useState(false);

  // Monitor error message changes
  useEffect(() => {
    if (errorMessage && errorMessage !== '') {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [errorMessage]);

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
  };

  // Handle cleanup after animation
  const handleExited = () => {
    setErrorMessage('');
  };

  console.log('ErrorDisplay rendering:', { errorMessage, open }); // Debug info

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      key={errorMessage}
    >
      <Typography variant="h4" component="div">
        <Alert severity="error">{errorMessage}</Alert>
      </Typography>
    </Snackbar>
  );
};

export default ErrorDisplay;
