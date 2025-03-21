import React from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import DiscordLogin from './DiscordLogin';
import Box from '@mui/material/Box';
import { useThemeStore } from '../zustand/useThemeStore';

const TopBar: React.FC = () => {
  const { theme } = useThemeStore();
  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: theme.palette.secondary.dark }}
    >
      <Toolbar>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <Typography
            variant="h2"
            component="div"
            sx={{
              color: theme.palette.vibrant.main,
              fontFamily: '"Architects Daughter", cursive', // custom font
              textShadow: `2px 2px 6px ${theme.palette.secondary.dark}, 2px 2px 6px ${theme.palette.secondary.dark}`, // improve legibility
            }}
          >
            Go To Hell
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DiscordLogin />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
