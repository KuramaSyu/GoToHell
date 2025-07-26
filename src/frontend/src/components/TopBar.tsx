import React from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import DiscordLogin from './DiscordLogin';
import Box from '@mui/material/Box';
import { useThemeStore } from '../zustand/useThemeStore';
import { alpha, Button, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { Streak } from './Streak';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { LogoSvgComponent } from '../pages/LoadingPage/Main';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    // Mobile view
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
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <DiscordLogin />
            </Box>

            {/* Title */}
            <Typography
              variant="h4"
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
            {/* Discord Login and Settings */}
            <Box
              sx={{
                gap: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '30%',
              }}
            >
              <Button variant="outlined" onClick={() => navigate('/settings')}>
                <SettingsIcon
                  sx={{ filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))' }}
                />
              </Button>
              <Button variant="outlined" onClick={() => navigate('/friends')}>
                <PeopleIcon
                  sx={{ filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))' }}
                />
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop view
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
            justifyContent: 'space-between',
          }}
        >
          {/* Title */}
          <Box>
            <Button
              startIcon={<LogoSvgComponent style={{ width: 60, height: 60 }} />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 6,
                color: theme.palette.vibrant.main,
                fontFamily: '"Architects Daughter", cursive',
                textShadow: `2px 2px 6px ${theme.palette.secondary.dark}, 2px 2px 6px ${theme.palette.secondary.dark}`,
                fontSize: theme.typography.h2.fontSize, // Maintain h2 size
                fontWeight: theme.typography.h2.fontWeight, // Maintain h2 weight
                lineHeight: theme.typography.h2.lineHeight, // Maintain h2 line height
                padding: '0px 8px',
                textTransform: 'none', // Prevent uppercase transformation
                '&:hover': {
                  backgroundColor: alpha(theme.palette.vibrant.main, 0.3),
                },
              }}
            >
              Go To Hell
            </Button>
          </Box>

          {/* Streak */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Streak />
          </Box>

          {/* Discord Login and Settings */}
          <Box
            sx={{
              gap: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Button variant="outlined" onClick={() => navigate('/settings')}>
              <SettingsIcon
                sx={{ filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))' }}
              />
            </Button>
            <Button variant="outlined" onClick={() => navigate('/friends')}>
              <PeopleIcon
                sx={{ filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))' }}
              />
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <DiscordLogin />
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
