import { Box, darken, SvgIcon, SvgIconProps } from '@mui/material';
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
import { defaultTheme, useThemeStore } from '../../zustand/useThemeStore';
import { ThemeProvider } from '@emotion/react';

interface LogoSvgComponentProps {
  style?: React.CSSProperties;
}

const LogoSvgComponent: React.FC<LogoSvgComponentProps> = ({ style }) => {
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

export const LoadingPage: React.FC = () => {
  const [startTime, setStartTime] = React.useState(Date.now());
  const { isLoading, setLoading } = useLoadingStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const size = useMinSquareSize(containerRef);
  const initialLoadingMap = new Map<string, LoadingMapValue>([
    ['You', { loaded: false, time: 0 }],
    ['Your Friends', { loaded: false, time: 0 }],
    ['Streaks', { loaded: false, time: 0 }],
    ['History', { loaded: false, time: 0 }],
    ['Big Numbers', { loaded: false, time: 0 }],
    ['Your Settings', { loaded: false, time: 0 }],
    ['Overdue Deaths', { loaded: false, time: 0 }],
    ['Theme', { loaded: false, time: 0 }],
  ]);
  const [loadingMap, setLoadingMap] = React.useState(initialLoadingMap);
  console.log(`Size: ${size}`);
  useEffect(() => {
    const startTime = Date.now();

    // timeout, to make sure, that at least the svg loads
    setTimeout(() => {
      useThemeStore
        .getState()
        .initializeTheme()
        .then(() => {
          setLoadingMap((prev) => {
            prev.set('Theme', { loaded: true, time: Date.now() - startTime });
            return new Map(prev);
          });
        });
    }, 0);
  }, []);

  useEffect(() => {
    const minStartUpTime = 100; // Minimum time to show loading screen
    const allLoaded = loadingMap
      .values()
      .map((v) => v.loaded)
      .every((loaded) => loaded === true);
    if (allLoaded) {
      const elapsedTime = Date.now() - startTime;
      setTimeout(() => {
        setLoading(false);
      }, Math.max(minStartUpTime - elapsedTime, 125));
    }
  }, [loadingMap]);

  useEffect(() => {
    const init = async () => {
      var startTime = Date.now();
      const user = await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .fetchIfNeeded();
      setLoadingMap((prev) => {
        prev.set('You', { loaded: true, time: Date.now() - startTime });
        return new Map(prev);
      });

      startTime = Date.now();
      const friends = await new ApiRequirementsBuilder()
        .add(ApiRequirement.Friends)
        .fetchIfNeeded();
      setLoadingMap((prev) => {
        prev.set('Your Friends', {
          loaded: true,
          time: Date.now() - startTime,
        });
        return new Map(prev);
      });

      startTime = Date.now();
      const data = await new ApiRequirementsBuilder()
        .add(ApiRequirement.AllStreaks)
        .add(ApiRequirement.AllRecentSports)
        .add(ApiRequirement.TotalScore)
        .add(ApiRequirement.Preferences)
        .add(ApiRequirement.OverdueDeaths)
        .fetchIfNeeded();

      const value = {
        loaded: true,
        time: Math.round((Date.now() - startTime) / 5), // /5 because 5 Things are fetched
      };
      setLoadingMap((prev) => {
        prev.set('Streaks', value);
        prev.set('History', value);
        prev.set('Big Numbers', value);
        prev.set('Your Settings', value);
        prev.set('Overdue Deaths', value);
        return new Map(prev);
      });
    };
    init();
  }, []);

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
        }}
      >
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
            backgroundColor: darken(defaultTheme.palette.muted.main, 0.1),
            padding: 2,
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
              {Array.from(loadingMap.keys()).map((key) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell align="center">
                    {loadingMap.get(key)?.loaded ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CircularProgress size={20} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {loadingMap.get(key)?.time || '---'} ms
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ThemeProvider>
  );
};
