import React, { useState, useCallback } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { BACKEND_BASE } from '../statics';
import useAppState from '../zustand/Error';

const AddFriend: React.FC = () => {
  const [friendId, setFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { setErrorMessage } = useAppState();

  const update = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setMessage('');
      setError('');

      if (!friendId) {
        setErrorMessage('Friend ID is required');
        return;
      }

      const id = BigInt(friendId);
      console.log(`ID as string: ${friendId}, as num: ${id}`);
      if (id === null || id <= 0) {
        setErrorMessage('Please enter a valid numeric Friend ID');
        return;
      }

      if (friendId.length !== 18) {
        setErrorMessage("Discord ID's usually contain 18 numbers");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_BASE}/api/friends`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            friend_id: friendId,
            status: 'pending',
          }),
        });
        const result = await response.json();
        if (response.ok) {
          setMessage('Friend request sent successfully!');
          setFriendId('');
        } else {
          setError(result.error || 'Error sending friend request');
        }
      } catch (err) {
        setError(`Error sending friend request: ${err}`);
      }
    },
    [friendId]
  );

  return (
    <Box
      component="form"
      onSubmit={update}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '300px',
        margin: '0 auto',
        mt: 4,
      }}
    >
      <TextField
        label="Friend User ID"
        variant="outlined"
        value={friendId}
        onChange={(e) => setFriendId(e.target.value)}
      />
      <Button type="submit" variant="contained" color="primary">
        Add Friend
      </Button>
      {message && <Typography color="success.main">{message}</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default AddFriend;
