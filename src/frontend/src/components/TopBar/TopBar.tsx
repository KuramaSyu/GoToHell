import React, { memo, useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import DiscordLogin from './../DiscordLogin';
import Box from '@mui/material/Box';
import { useThemeStore } from '../../zustand/useThemeStore';
import {
  alpha,
  Avatar,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Slide,
  Stack,
  SwipeableDrawer,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { Streak } from './Streak';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { LogoSvgComponent } from '../../pages/LoadingPage/Main';
import { Title } from '../../pages/LoadingPage/Title';
import HomeIcon from '@mui/icons-material/Home';
import { ThemeProvider } from '@emotion/react';
import { useUserStore } from '../../userStore';
import { useStreakStore } from '../../zustand/StreakStore';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import HistoryIcon from '@mui/icons-material/History';

import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { PersonalGoalSynopsis } from './PersonalGoalSynopsis';
import { BoxHoverPropsTopBar } from '../../theme/statics';
import { UserProfileDesktopDrawer } from '../UserProfile/DrawerWrapper';

export enum Pages {
  HOME = '/',
  FRIENDS = '/friends',
  SETTINGS = '/settings',
  HISTORY = '/history',
  SETTINGSV2 = '/settings-v2',
}

function containedIfSelected(page: Pages) {
  const location = useLocation();
  return location.pathname === page ? 'contained' : 'outlined';
}

const UserDrawerContents = memo(() => {
  const { streak } = useStreakStore();
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchStreak() {
      if (!userDrawerOpen || !user) return;
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.Streak)
        .forceFetch();
    }
    fetchStreak();
  }, [userDrawerOpen]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Drag Handle */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1,
          cursor: 'pointer',
        }}
        onClick={() => setUserDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            backgroundColor: alpha(theme.palette.text.primary, 0.3),
            borderRadius: 2,
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.5),
            },
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              p: 1,
            }}
          >
            <Avatar
              sx={{ width: 64, height: 64 }}
              src={user ? user.getAvatarUrl() : undefined}
              alt={user ? user.username : ''}
            ></Avatar>
            <Divider orientation='vertical'></Divider>
            <Typography variant='h6'> {user?.username ?? 'login'} </Typography>
          </Box>
          <Divider></Divider>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '70%' }}>
            <Typography variant='h6'>Streak</Typography>
            <Typography variant='subtitle2'>
              Amount of days where sport was back to back done
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '50%',
              justifyContent: 'center',
              alignItems: 'center',
              justifyItems: 'center',
              alignContent: 'center',
            }}
          >
            <Typography variant='h3'>
              <LocalFireDepartmentIcon fontSize='inherit' />
              {streak}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

const MobileTopBar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const { user } = useUserStore();

  if (isMobile) {
    // Mobile view
    return (
      <>
        <AppBar
          position='fixed'
          sx={{
            backgroundColor: theme.palette.muted.dark,
            top: 'auto', // top auto and bottom 0 to stick to bottom
            bottom: 0,
          }}
        >
          <Toolbar>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Friends, History and Settings */}
              <Box
                sx={{
                  gap: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  width: '70%',
                }}
              >
                <ToggleButtonGroup
                  value={location.pathname}
                  exclusive
                  onChange={(event, newValue) => {
                    if (newValue !== null) {
                      navigate(newValue);
                    }
                  }}
                  sx={{
                    gap: 1,
                  }}
                  color='secondary'
                >
                  <ToggleButton value={Pages.HISTORY}>
                    <HistoryIcon />
                  </ToggleButton>
                  <ToggleButton value={Pages.HOME}>
                    <HomeIcon />
                  </ToggleButton>
                  <ToggleButton value={Pages.FRIENDS}>
                    <PeopleIcon />
                  </ToggleButton>
                  <ToggleButton value={Pages.SETTINGSV2}>
                    <SettingsIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => setUserDrawerOpen(true)}>
                  <Avatar
                    sx={{ width: 40, height: 40 }}
                    src={user ? user.getAvatarUrl() : undefined}
                    alt={user ? user.username : ''}
                  ></Avatar>
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Drawer which shows streak and user info */}
        <SwipeableDrawer
          anchor='bottom'
          onOpen={() => setUserDrawerOpen(true)}
          open={userDrawerOpen}
          onClose={() => setUserDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              height: 1 / 3,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              backgroundColor: alpha(theme.palette.muted.dark, 9 / 10),
            },
          }}
        >
          <UserDrawerContents />
        </SwipeableDrawer>
      </>
    );
  }
});

const DesktopTopBar = memo(() => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const { user } = useUserStore();

  return (
    <>
      <AppBar
        position='fixed'
        sx={{
          backgroundColor: theme.palette.background.default,
          //color: theme.palette.primary.light,
        }}
      >
        <Toolbar>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {/* Title */}
            <Tooltip title='Go to Main Page' arrow>
              <Box>
                <Button
                  startIcon={
                    <LogoSvgComponent style={{ width: 60, height: 60 }} />
                  }
                  onClick={() => navigate('/')}
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    color: theme.palette.vibrant.light,
                    fontSize: theme.typography.h3.fontSize,
                    padding: '0px 8px',
                    textTransform: 'none', // Prevent uppercase transformation
                    ...BoxHoverPropsTopBar(theme),
                  }}
                >
                  <Title theme={theme} />
                </Button>
              </Box>
            </Tooltip>

            {/* Streak */}
            <Stack direction='row' gap={2}>
              <Box
                sx={{
                  ...BoxHoverPropsTopBar(theme),
                  borderRadius: theme.shape.borderRadius,
                  px: theme.spacing(2),
                  py: 0,
                }}
              >
                <Streak />
              </Box>
              <PersonalGoalSynopsis typographyVariant='h3'></PersonalGoalSynopsis>
            </Stack>

            {/* Home, Friends, Settings, Discord Login or Profile */}
            <Box
              sx={{
                gap: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Button
                variant={containedIfSelected(Pages.HOME)}
                onClick={() => navigate(Pages.HOME)}
                color='inherit'
              >
                <HomeIcon />
              </Button>
              <Button
                variant={containedIfSelected(Pages.FRIENDS)}
                onClick={() => navigate(Pages.FRIENDS)}
                color='inherit'
              >
                <PeopleIcon />
              </Button>
              <Button
                variant={containedIfSelected(Pages.SETTINGSV2)}
                onClick={() => navigate(Pages.SETTINGSV2)}
                color='inherit'
              >
                <SettingsIcon />
              </Button>
              <DiscordLogin />
              <IconButton onClick={() => setUserDrawerOpen(true)}>
                <Avatar
                  src={user ? user.getAvatarUrl() : ''}
                  alt={user ? user.username : ''}
                  sx={{
                    width: 60,
                    height: 60,
                    filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))',
                  }}
                />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer which shows streak and user info */}
      <Drawer
        anchor='right'
        // onOpen={() => {}}
        open={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        // onBlur={() => setUserDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 1 / 3,
            borderTopLeftRadius: theme.shape.borderRadius,
            borderBottomLeftRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.muted.dark, 9 / 10),
          },
        }}
      >
        <UserProfileDesktopDrawer user={user} />
      </Drawer>
    </>
  );
});

const TopBar: React.FC = () => {
  const { isMobile } = useBreakpoint();
  return isMobile ? <MobileTopBar /> : <DesktopTopBar />;
};

export default TopBar;
