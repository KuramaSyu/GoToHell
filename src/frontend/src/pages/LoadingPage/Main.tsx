import { alpha, Box, darken, SvgIcon, SvgIconProps } from '@mui/material';
import { useLoadingStore } from '../../zustand/loadingStore';
import React, { useEffect } from 'react';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { Api } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BlockIcon from '@mui/icons-material/Block';
import Fade from '@mui/material/Fade';
import { useThemeStore } from '../../zustand/useThemeStore';
import { ThemeProvider } from '@emotion/react';
import { useUserStore } from '../../userStore';
import {
  ExpandingCircleBackground,
  StaticCircleBackground,
} from './CircleBackground';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Title } from './Title';
import { useSportStore } from '../../useSportStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useMinSquareSize } from './minSquareSize';
import { defaultTheme } from '../../zustand/defaultTheme';

interface LogoSvgComponentProps {
  style?: React.CSSProperties;
  monochrome?: boolean; // add monochrome flag
}

export const LogoSvgComponent: React.FC<LogoSvgComponentProps> = ({
  style,
  monochrome = false, // default to false
}) => {
  const { theme } = useThemeStore(); // get current theme

  // If monochrome, apply greyscale and color filter
  const filterStyle = monochrome
    ? {
        filter: `grayscale(1) brightness(1.1) drop-shadow(0 0 0 ${theme.palette.primary.main})`,
      }
    : {};

  return (
    <img
      src='/assets/GoToHell-Icon.svg'
      alt='GoToHell Logo'
      style={{
        width: '100%',
        height: '100%',
        ...(style || {}),
        ...filterStyle,
      }}
    />
  );
};

export const SmallLogoSvgComponent: React.FC<LogoSvgComponentProps> = ({
  style,
  monochrome = false, // default to false
}) => {
  const { theme } = useThemeStore(); // get current theme

  // If monochrome, apply greyscale and color filter
  const filterStyle = monochrome
    ? {
        filter: `grayscale(1) brightness(1.1) drop-shadow(0 0 0 ${theme.palette.primary.main})`,
      }
    : {};

  return (
    <img
      src='/assets/GoToHell-Icon-small.svg'
      alt='GoToHell Logo'
      style={{
        width: '100%',
        height: '100%',
        ...(style || {}),
        ...filterStyle,
      }}
    />
  );
};

interface LoadingMapValue {
  loaded: boolean;
  time: number;
}

enum LoadingStatus {
  Loading,
  Success,
  Error,
  Skipped,
}
class LoadingComponent {
  name: string;
  loaded: boolean;
  time: number;
  status: LoadingStatus;

  constructor(
    name: string,
    loaded: boolean,
    time: number,
    status?: LoadingStatus,
  ) {
    this.name = name;
    this.loaded = loaded;
    this.time = time;
    this.status =
      status !== undefined
        ? status
        : loaded
          ? LoadingStatus.Success
          : LoadingStatus.Loading;
  }

  setStatus(status: LoadingStatus) {
    this.status = status;
    this.loaded = status === LoadingStatus.Success;
  }
}

export const LoadingPage: React.FC = () => {
  const [startTime, setStartTime] = React.useState(Date.now());
  const { isLoading, setLoading } = useLoadingStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const size = useMinSquareSize(containerRef);
  const MIN_STARTUP_TIME = 750;
  const MIN_STARTUP_TIME_S = MIN_STARTUP_TIME / 1000;
  const initialLoadingMap = new Map<string, LoadingComponent>([
    ['You', new LoadingComponent('You', false, 0)],
    ['Your Friends', new LoadingComponent('Your Friends', false, 0)],
    ['Streaks', new LoadingComponent('Streaks', false, 0)],
    ['History', new LoadingComponent('History', false, 0)],
    ['Big Numbers', new LoadingComponent('Big Numbers', false, 0)],
    ['Your Settings', new LoadingComponent('Your Settings', false, 0)],
    ['goals', new LoadingComponent('Your Goals', false, 0)],
    ['Overdue Deaths', new LoadingComponent('Overdue Deaths', false, 0)],
    ['Theme', new LoadingComponent('Theme', false, 0)],
  ]);
  const [loadingMap, setLoadingMap] = React.useState(initialLoadingMap);
  const { isMobile } = useBreakpoint();

  // Initialize theme
  useEffect(() => {
    const startTime = Date.now();

    // setTimeout to make sure, that svg loads first
    setTimeout(() => {
      useThemeStore
        .getState()
        .initializeTheme()
        .then(() => {
          setLoadingMap((prev) => {
            const comp = prev.get('Theme');
            if (comp) {
              comp.loaded = true;
              comp.time = Date.now() - startTime;
              comp.setStatus(LoadingStatus.Success);
              prev.set('Theme', comp);
            }
            return new Map(prev);
          });
        })
        .catch(() => {
          setLoadingMap((prev) => {
            const comp = prev.get('Theme');
            if (comp) {
              comp.setStatus(LoadingStatus.Error);
              prev.set('Theme', comp);
            }
            return new Map(prev);
          });
        });
    }, 0);
  }, []);

  // set isLoading to false, when everthing is initialized
  useEffect(() => {
    const allLoaded = Array.from(loadingMap.values())
      .map(
        (v) =>
          v.status === LoadingStatus.Success ||
          v.status === LoadingStatus.Skipped ||
          v.status === LoadingStatus.Error,
      )
      .every((loaded) => loaded === true);
    if (allLoaded) {
      const elapsedTime = Date.now() - startTime;
      setTimeout(
        () => {
          setLoading(false);
        },
        Math.max(MIN_STARTUP_TIME - elapsedTime, 125),
      );
    }
  }, [loadingMap]);

  // load Api requirements
  useEffect(() => {
    const init = async () => {
      // load user
      var startTime = Date.now();
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .fetchIfNeeded();
      const user = useUserStore.getState().user;
      setLoadingMap((prev) => {
        const comp = prev.get('You');
        if (comp) {
          comp.loaded = true;
          comp.time = Date.now() - startTime;
          comp.setStatus(
            user === null ? LoadingStatus.Error : LoadingStatus.Success,
          );
          prev.set('You', comp);
        }
        return new Map(prev);
      });

      if (user === null) {
        // user failed to load -> skip all other components
        console.error('User not found, redirecting to login');
        setLoadingMap((prev) => {
          prev.forEach((comp, key) => {
            if (key !== 'You' && key !== 'Theme') {
              comp.setStatus(LoadingStatus.Skipped);
              comp.time = 0;
              prev.set(key, comp);
            }
          });
          return new Map(prev);
        });
        return;
      }

      // load friends
      startTime = Date.now();
      try {
        const _friends = await new ApiRequirementsBuilder()
          .add(ApiRequirement.Friends)
          .fetchIfNeeded();
        setLoadingMap((prev) => {
          const comp = prev.get('Your Friends');
          if (comp) {
            comp.loaded = true;
            comp.time = Date.now() - startTime;
            comp.setStatus(LoadingStatus.Success);
            prev.set('Your Friends', comp);
          }
          return new Map(prev);
        });
      } catch {
        setLoadingMap((prev) => {
          const comp = prev.get('Your Friends');
          if (comp) {
            comp.setStatus(LoadingStatus.Error);
            prev.set('Your Friends', comp);
          }
          return new Map(prev);
        });
      }

      async function loadRequirement(requirement: ApiRequirement, key: string) {
        const startTime = Date.now();

        var loadingComp = loadingMap.get(key);
        if (loadingComp === undefined) {
          console.error(
            `Loading Page: requested key ${key} which does not exist`,
          );
          return;
        }

        loadingComp.setStatus(LoadingStatus.Loading);
        setLoadingMap((prev) => prev.set(key, loadingComp!));

        try {
          const _data = await new ApiRequirementsBuilder()
            .add(requirement)
            .fetchIfNeeded();
          loadingComp.setStatus(LoadingStatus.Success);
        } catch {
          loadingComp.setStatus(LoadingStatus.Error);
        } finally {
          loadingComp.time = Date.now() - startTime;
          setLoadingMap((prev) => prev.set(key, loadingComp!));
        }
      }

      await Promise.all(
        [
          { key: 'Streaks', requirement: ApiRequirement.AllStreaks },
          { key: 'History', requirement: ApiRequirement.AllRecentSports },
          { key: 'Big Numbers', requirement: ApiRequirement.TotalScore },
          { key: 'Your Settings', requirement: ApiRequirement.Preferences },
          { key: 'Overdue Deaths', requirement: ApiRequirement.OverdueDeaths },
          { key: 'goals', requirement: ApiRequirement.UserPersonalGoals },
        ].map(({ key, requirement }) => loadRequirement(requirement, key)),
      );
      setLoadingMap((prev) => new Map(prev));
    };
    init();
  }, []);

  const getStatusIcon = (status: LoadingStatus) => {
    switch (status) {
      case LoadingStatus.Success:
        return (
          <CheckCircleIcon sx={{ color: defaultTheme.palette.success.main }} />
        );
      case LoadingStatus.Error:
        return <ErrorIcon sx={{ color: defaultTheme.palette.error.main }} />;
      case LoadingStatus.Skipped:
        return (
          <BlockIcon sx={{ color: defaultTheme.palette.secondary.main }} />
        );
      default:
        return <CircularProgress size={24} />;
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          padding: 2,
          backgroundColor: defaultTheme.palette.muted.dark,
          zIndex: 5,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 4,
            width: '100vw',
            height: '100vh',
          }}
        >
          <ExpandingCircleBackground
            color={defaultTheme.palette.background.default}
            duration={MIN_STARTUP_TIME_S * 1.4}
            expansionScale={100}
            initialOpacity={1}
            animateOpacity={1}
            initialAtXPercent={0}
            initialAtYPercent={0}
            animateAtXPercent={isMobile ? 50 : 0}
            animateAtYPercent={isMobile ? 0 : 50}
          />
          <StaticCircleBackground
            color={defaultTheme.palette.muted.dark}
            sizePercent={isMobile ? 60 : 50}
            atXPercent={isMobile ? 50 : 100}
            atYPercent={isMobile ? 100 : 50}
            opacity={1}
          />
        </Box>
        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'center',
            alignItems: 'center',
            width: isMobile ? '100%' : 2 / 3,
            height: '100%',
            zIndex: 5,
            pb: isMobile ? 10 : 0, // to keep the icon away from the table
          }}
        >
          <Box sx={{ fontSize: isMobile ? '4rem' : '10vh' }}>
            <Title theme={defaultTheme} />
          </Box>
          <Box
            sx={{
              width: (size * 2) / 3,
              height: (size * 2) / 3,
              display: 'flex',
              zIndex: 5,
            }}
          >
            <LogoSvgComponent />
          </Box>
        </Box>

        <TableContainer
          // component={Paper}
          sx={{
            borderRadius: 5,
            display: 'flex',
            width: isMobile ? '100%' : '33.33%',
            maxHeight: isMobile ? '50%' : undefined,

            padding: isMobile ? 1 : 2,
            zIndex: 5,
            border: `2px solid ${defaultTheme.palette.muted.light}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Load Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(loadingMap.values()).map((comp) => {
                return (
                  <TableRow key={comp.name}>
                    <TableCell>{comp.name}</TableCell>
                    <TableCell align='center'>
                      <span>
                        {comp ? (
                          getStatusIcon(comp.status)
                        ) : (
                          <CircularProgress size={24} />
                        )}
                      </span>
                    </TableCell>
                    <TableCell align='center'>
                      {comp && comp.time > 0 ? comp.time + ' ms' : '---'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ThemeProvider>
  );
};
