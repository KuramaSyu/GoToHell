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
import { defaultTheme, useThemeStore } from '../../zustand/useThemeStore';
import { ThemeProvider } from '@emotion/react';
import { useUserStore } from '../../userStore';
import { ExpandingCircleBackground } from './CircleBackground';

interface LogoSvgComponentProps {
  style?: React.CSSProperties;
}

export const LogoSvgComponent: React.FC<LogoSvgComponentProps> = ({
  style,
}) => {
  return (
    <img
      src="/assets/GoToHell-Icon.svg"
      alt="GoToHell Logo"
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
};

interface LoadingMapValue {
  loaded: boolean;
  time: number;
}

const useMinSquareSize = (ref: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = React.useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      setSize(Math.min(width, height));
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);
  return size;
};

enum LoadingStatus {
  Loading,
  Success,
  Error,
  Skipped,
}
class LoadingComponent {
  loaded: boolean;
  time: number;
  status: LoadingStatus;

  constructor(loaded: boolean, time: number, status?: LoadingStatus) {
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
    ['You', new LoadingComponent(false, 0)],
    ['Your Friends', new LoadingComponent(false, 0)],
    ['Streaks', new LoadingComponent(false, 0)],
    ['History', new LoadingComponent(false, 0)],
    ['Big Numbers', new LoadingComponent(false, 0)],
    ['Your Settings', new LoadingComponent(false, 0)],
    ['Overdue Deaths', new LoadingComponent(false, 0)],
    ['Theme', new LoadingComponent(false, 0)],
  ]);
  const [loadingMap, setLoadingMap] = React.useState(initialLoadingMap);

  useEffect(() => {
    const startTime = Date.now();

    // timeout, to make sure, that at least the svg loads
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

  useEffect(() => {
    const allLoaded = Array.from(loadingMap.values())
      .map(
        (v) =>
          v.status === LoadingStatus.Success ||
          v.status === LoadingStatus.Skipped ||
          v.status === LoadingStatus.Error
      )
      .every((loaded) => loaded === true);
    if (allLoaded) {
      const elapsedTime = Date.now() - startTime;
      setTimeout(() => {
        setLoading(false);
      }, Math.max(MIN_STARTUP_TIME - elapsedTime, 125));
    }
  }, [loadingMap]);

  useEffect(() => {
    const init = async () => {
      var startTime = Date.now();
      try {
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
              user === null ? LoadingStatus.Error : LoadingStatus.Success
            );
            prev.set('You', comp);
          }
          return new Map(prev);
        });

        if (user === null) {
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
      } catch {
        setLoadingMap((prev) => {
          const comp = prev.get('You');
          if (comp) {
            comp.setStatus(LoadingStatus.Error);
            prev.set('You', comp);
          }
          return new Map(prev);
        });
        return;
      }

      startTime = Date.now();
      try {
        const friends = await new ApiRequirementsBuilder()
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

      startTime = Date.now();
      try {
        const data = await new ApiRequirementsBuilder()
          .add(ApiRequirement.AllStreaks)
          .add(ApiRequirement.AllRecentSports)
          .add(ApiRequirement.TotalScore)
          .add(ApiRequirement.Preferences)
          .add(ApiRequirement.OverdueDeaths)
          .fetchIfNeeded();

        const value = Math.round((Date.now() - startTime) / 5);
        setLoadingMap((prev) => {
          [
            'Streaks',
            'History',
            'Big Numbers',
            'Your Settings',
            'Overdue Deaths',
          ].forEach((key) => {
            const comp = prev.get(key);
            if (comp) {
              comp.loaded = true;
              comp.time = value;
              comp.setStatus(LoadingStatus.Success);
              prev.set(key, comp);
            }
          });
          return new Map(prev);
        });
      } catch {
        setLoadingMap((prev) => {
          [
            'Streaks',
            'History',
            'Big Numbers',
            'Your Settings',
            'Overdue Deaths',
          ].forEach((key) => {
            const comp = prev.get(key);
            if (comp) {
              comp.setStatus(LoadingStatus.Error);
              prev.set(key, comp);
            }
          });
          return new Map(prev);
        });
      }
    };
    init();
  }, []);

  const getStatusIcon = (status: LoadingStatus) => {
    switch (status) {
      case LoadingStatus.Success:
        return <CheckCircleIcon color="success" />;
      case LoadingStatus.Error:
        return <ErrorIcon color="error" />;
      case LoadingStatus.Skipped:
        return <BlockIcon color="disabled" />;
      default:
        return <CircularProgress size={24} />;
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
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
            color={defaultTheme.palette.primary.main}
            duration={MIN_STARTUP_TIME_S}
            initialOpacity={0.2}
            animateOpacity={0}
          />
          <ExpandingCircleBackground
            color={defaultTheme.palette.secondary.main}
            duration={MIN_STARTUP_TIME_S * 0.8}
            delay={MIN_STARTUP_TIME_S * 0.2}
            initialOpacity={0.2}
            animateOpacity={0}
          />
          <ExpandingCircleBackground
            color={defaultTheme.palette.primary.main}
            duration={MIN_STARTUP_TIME_S}
            delay={MIN_STARTUP_TIME_S * 0.4}
            initialOpacity={0.2}
            animateOpacity={0}
          />

          <ExpandingCircleBackground
            color={defaultTheme.palette.muted.dark}
            duration={MIN_STARTUP_TIME_S * 0.4}
            delay={MIN_STARTUP_TIME_S * 0.8}
            initialOpacity={0}
            animateOpacity={0.5}
          />
        </Box>
        <Box
          ref={containerRef}
          sx={{
            mb: 3,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            width: 2 / 3,
            height: '100%',
            // textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
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
            width: 1 / 4,

            padding: 2,
            zIndex: 5,
            border: `2px solid ${defaultTheme.palette.muted.main}`,
            color: defaultTheme.palette.muted.light,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Load Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(loadingMap.keys()).map((key) => {
                const comp = loadingMap.get(key);
                return (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell align="center">
                      <span>
                        {comp ? (
                          getStatusIcon(comp.status)
                        ) : (
                          <CircularProgress size={24} />
                        )}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      {comp ? comp.time : '---'} ms
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
