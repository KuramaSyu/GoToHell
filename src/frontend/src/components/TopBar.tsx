import React from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import DiscordLogin from './DiscordLogin';
import Box from '@mui/material/Box';
import { useThemeStore } from '../zustand/useThemeStore';
import { Button, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: theme.palette.secondary.dark }}
    >
      <CssBaseline></CssBaseline>
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
            onClick={() => navigate('/')}
            sx={{
              color: theme.palette.vibrant.main,
              fontFamily: '"Architects Daughter", cursive', // custom font
              textShadow: `2px 2px 6px ${theme.palette.secondary.dark}, 2px 2px 6px ${theme.palette.secondary.dark}`,
            }}
          >
            Go To Hell
          </Typography>
        </Box>
        <Box
          sx={{
            gap: 4,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Button variant="contained" onClick={() => navigate('/friends')}>
            Friends
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DiscordLogin />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
