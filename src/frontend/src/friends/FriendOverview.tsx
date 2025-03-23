import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Typography,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useThemeStore } from '../zustand/useThemeStore';
import TopBar from '../components/TopBar';
import { BACKEND_BASE } from '../statics';
import AddFriend from './AddFriend';
import IdDisplay from './IdDisplay';
import useAppState from '../zustand/Error';
import { useUserStore } from '../userStore';

interface Friend {
  id: number;
  requester_id: number;
  recipient_id: number;
  status: string;
  created_at: number;
}

enum TabIndex {
  Overview,
  Blocked,
  Incoming,
}

export const FriendOverview: React.FC = () => {
  const { theme } = useThemeStore();
  const backgroundImage = theme.custom.backgroundImage;
  const [loaded, setLoaded] = useState(false);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabIndex>(TabIndex.Overview);
  const [loading, setLoading] = useState(false);

  const { setErrorMessage } = useAppState();
  const { user } = useUserStore();

  function GetFriendId(f: Friend) {
    if (String(f.requester_id) == user?.id) {
      return f.recipient_id;
    }
    return f.requester_id;
  }

  useEffect(() => {
    if (backgroundImage && backgroundImage !== '') {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [backgroundImage]);

  // Fetch all friend relationships on mount and when a change is made.
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE}/api/friends`, {
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        setFriends(result.data);
        setError('');
      } else {
        setError(result.error || 'Error fetching friends');
      }
    } catch (err) {
      setError('Error fetching friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Delete friendship by id
  const handleDelete = async (id: number) => {
    if (String(id).length !== 18) {
      setErrorMessage('Discord IDs contain 18 Numbers');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_BASE}/api/friends/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        fetchFriends();
      } else {
        setError(result.error || 'Error deleting friendship');
      }
    } catch (err) {
      setError('Error deleting friendship');
    }
  };

  // Update friendship status (for accepting or blocking)
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/friends`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, friendship_id: id }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log(`response ok: ${JSON.stringify(result)}`);
        fetchFriends();
      } else {
        console.log(`error: ${JSON.stringify(result)}`);
        setError(result.error || 'Error updating friendship');
      }
    } catch (err) {
      setError(`Error updating friendship: ${err}`);
    }
  };

  // Filter friends based on the active tab.
  const filteredFriends = friends.filter((f) => {
    switch (activeTab) {
      case TabIndex.Overview:
        return f.status === 'accepted';
      case TabIndex.Blocked:
        return f.status === 'blocked';
      case TabIndex.Incoming:
        return f.status === 'pending';
      default:
        return false;
    }
  });

  return (
    <Box width="100vw">
      <ThemeProvider theme={theme!}>
        <CssBaseline></CssBaseline>
        {backgroundImage && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: theme.palette.background.default,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(9px)',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
              zIndex: 0,
              display: 'flex',
            }}
          />
        )}
        <Box sx={{ position: 'relative', zIndex: 1, p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'space-between',
              justifyContent: 'space-between',
            }}
          >
            {/* Friendship Box */}
            <Box
              sx={{ display: 'flex', minWidth: 1 / 4, flexDirection: 'column' }}
            >
              <Typography variant="h4" gutterBottom>
                Friend Overview
              </Typography>
              <Tabs
                value={activeTab}
                onChange={(_e, newValue) => setActiveTab(newValue)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Existing" value={TabIndex.Overview} />
                <Tab label="Blocked" value={TabIndex.Blocked} />
                <Tab label="Incoming" value={TabIndex.Incoming} />
              </Tabs>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {filteredFriends.map((friend) => (
                    <ListItem
                      key={friend.id}
                      sx={{ borderBottom: '1px solid #ccc' }}
                    >
                      <ListItemText
                        primary={GetFriendId(friend)}
                        secondary={`Status: ${friend.status}`}
                      />
                      {activeTab === TabIndex.Incoming && (
                        <Box>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() =>
                              handleUpdateStatus(friend.id, 'accepted')
                            }
                            sx={{ mr: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(friend.id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                      {activeTab === TabIndex.Overview && (
                        <Box>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(friend.id)}
                            sx={{ mr: 1 }}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleUpdateStatus(friend.id, 'blocked')
                            }
                          >
                            Block
                          </Button>
                        </Box>
                      )}
                      {activeTab === TabIndex.Blocked && (
                        <Box>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleUpdateStatus(friend.id, 'accepted')
                            }
                          >
                            Unblock
                          </Button>
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
            <Box>
              <AddFriend></AddFriend>
            </Box>
            <Box>
              <IdDisplay></IdDisplay>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  );
};

export default FriendOverview;
