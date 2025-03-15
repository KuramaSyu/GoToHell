import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Button,
  Container,
  Box,
  Paper,
  Avatar,
  Typography,
} from '@mui/material';
import ThemeSwitcher from '../ThemeSwitcher';
import { themes, getTheme } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { useUserStore } from '../userStore';
import { BACKEND_BASE } from '../statics';

// Define TypeScript interface for Discord user data
interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
}

// Create a DiscordUser class that implements the interface
class DiscordUserImpl implements DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;

  constructor(data: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    email: string;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = data.avatar;
    this.email = data.email;
  }

  getAvatarUrl(): string {
    return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
  }

  async fetchTotalScore(): Promise<Response> {
    return await fetch(`${BACKEND_BASE}/api/sports/total`, {
      credentials: 'include',
    });
  }
}

export { DiscordUserImpl };

const DiscordLogin: React.FC = () => {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState<boolean>(true);
  const { currentTheme, setTheme } = useThemeStore();
  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async (): Promise<void> => {
      try {
        const response = await fetch(`${BACKEND_BASE}/api/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData: DiscordUser = await response.json();
          console.log(JSON.stringify(userData, null, 2));
          setUser(new DiscordUserImpl(userData));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = (): void => {
    window.location.href = `${BACKEND_BASE}/api/auth/discord`;
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch(`${BACKEND_BASE}/api/auth/logout`, {
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ThemeProvider theme={getTheme(currentTheme)}>
      {/* CssBaseline applies the theme's background and text colors */}
      <CssBaseline />
      <Paper
        elevation={3}
        sx={{ textAlign: 'center', maxWidth: 400, mx: 'auto' }}
      >
        {user ? (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={4}
            my={1}
          >
            <Avatar
              src={user.getAvatarUrl()}
              alt={user.username}
              sx={{ width: 60, height: 60 }}
            />
            <Button variant="contained" color="primary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            startIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 127.14 96.36"
                width="24"
                height="24"
              >
                <path
                  d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83A72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36A77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19A77,77,0,0,0,90.85,96.36A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                  fill="#ffffff"
                />
              </svg>
            }
          >
            Login
          </Button>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default DiscordLogin;
