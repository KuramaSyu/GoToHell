import { Box, SvgIcon, SvgIconProps } from '@mui/material';
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
import LogoSvg from '../../assets/GoToHell-Icon.svg';

interface LogoSvgComponentProps {
  style?: React.CSSProperties;
}

const LogoSvgComponent: React.FC<LogoSvgComponentProps> = ({ style }) => {
  return (
    <img
      src={LogoSvg}
      alt={'GoToHell Logo'}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
};

export const LoadingPage: React.FC = () => {
  const { isLoading, setLoading } = useLoadingStore();
  const [loadingMap, setLoadingMap] = React.useState<Map<string, boolean>>(
    new Map()
  );

  useEffect(() => {
    const init = async () => {
      const user = await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .fetchIfNeeded();
      setLoadingMap((prev) => {
        prev.set('user', true);
        return new Map(prev);
      });
      const friends = await new ApiRequirementsBuilder()
        .add(ApiRequirement.Friends)
        .fetchIfNeeded();
      setLoadingMap((prev) => {
        prev.set('friends', true);
        return new Map(prev);
      });
      const data = await new ApiRequirementsBuilder()
        .add(ApiRequirement.AllStreaks)
        .add(ApiRequirement.AllRecentSports)
        .add(ApiRequirement.TotalScore)
        .add(ApiRequirement.Preferences)
        .add(ApiRequirement.OverdueDeaths)
        .fetchIfNeeded();

      setLoadingMap((prev) => {
        prev.set('Streaks', true);
        prev.set('History', true);
        prev.set('Big Numbers', true);
        prev.set('Your Settings', true);
        return new Map(prev);
      });
    };
    setLoading(true);
    init()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error during initialization:', error);
        setLoading(false);
      });
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        padding: 2,
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          mb: 3,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          width: 2 / 3,
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
        <Box sx={{ width: 4 / 5, display: 'flex' }}>
          <LogoSvgComponent />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxWidth: 600, width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(loadingMap.keys()).map((key) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell align="center">
                  {loadingMap.get(key) ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
