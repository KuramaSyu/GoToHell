import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useUserStore } from '../userStore';



const IdDisplay: React.FC = () => {
  const { user } = useUserStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(user?.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy!', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
      <Typography variant="body1">Your ID: {user?.id}</Typography>
      <Button
        variant="contained"
        size="small"
        onClick={handleCopy}
        startIcon={<ContentCopyIcon />}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </Box>
  );
};

export default IdDisplay;