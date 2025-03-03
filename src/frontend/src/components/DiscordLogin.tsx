import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box, Paper, Avatar, Typography } from '@mui/material';import ThemeSwitcher from '../ThemeSwitcher';
import { lightTheme, darkTheme, nordTheme, githubTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';


// Define TypeScript interface for Discord user data
interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
}

const DiscordLogin: React.FC = () => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentTheme, setTheme } = useThemeStore();
  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData: DiscordUser = await response.json();
          console.log(JSON.stringify(userData, null, 2));
          setUser(userData);
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
    window.location.href = 'http://localhost:8080/api/auth/discord';
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
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
    <ThemeProvider theme={themes[currentTheme]}>
      {/* CssBaseline applies the theme's background and text colors */}
      <CssBaseline />
      <Paper elevation={3} sx={{p: 3, textAlign: "center", maxWidth: 400, mx: "auto"}}>
        {user? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt={user.username}
              sx={{width: 80, height: 80}}
            />
            <Typography variant='h6'>Welcome, {user.username}!</Typography>
            <Button
              variant='contained'
              color='primary'
              onClick={handleLogout}
            >Logout</Button>
          </Box>
        ) : (
          <Button
            variant='contained'
            color='primary'
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
          >Login with Discord</Button>
        )
        }
      </Paper>
    </ThemeProvider>
  );
};

export default DiscordLogin;
