import React, { useState, useCallback } from 'react';
import { Box, TextField, Button, Typography, Snackbar } from '@mui/material';
import { BACKEND_BASE } from '../../statics';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';

const AddFriend: React.FC = () => {
  const [friendId, setFriendId] = useState('');
  const [message, setFriendMessage] = useState('');
  const [error, setError] = useState('');
  const { setMessage } = useInfoStore();

  const update = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFriendMessage('');
      setError('');

      if (!friendId) {
        setMessage(new SnackbarUpdateImpl('User ID cannot be empty', 'error'));
        return;
      }

      const id = BigInt(friendId);
      console.log(`ID as string: ${friendId}, as num: ${id}`);
      if (id === null || id <= 0) {
        setMessage(
          new SnackbarUpdateImpl(
            'Please enter a valid numeric Friend ID',
            'error'
          )
        );
        return;
      }

      if (friendId.length !== 18) {
        setMessage(
          new SnackbarUpdateImpl(
            "Discord ID's usually contain 18 numbers",
            'error'
          )
        );
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
          setFriendMessage('Friend request sent successfully!');
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
