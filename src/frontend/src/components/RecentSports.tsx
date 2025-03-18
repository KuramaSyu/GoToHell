import { Box, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CloseIcon from '@mui/icons-material/Close';
import { useSpring, useTransition, animated } from 'react-spring';
import { BACKEND_BASE } from '../statics';
import { useUserStore } from '../userStore';
import { formatDistanceToNow } from 'date-fns';
import { useThemeStore } from '../zustand/useThemeStore';
import useAppState from '../zustand/Error';

interface Sport {
  id: number;
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
}

interface SportsApiResponse {
  data: Sport[];
}

// Wrap MUI's Box as an animated component for proper emotion handling.
const AnimatedBox = animated(Box);

export const RecentSports = () => {
  const [data, setData] = useState<SportsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // pageOffset refers to the starting index of visible records
  const [pageOffset, setPageOffset] = useState<number>(0);
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const { setErrorMessage } = useAppState();

  // Fetch data on mount and when the user changes.
  useEffect(() => {
    if (!user) return;
    const fetchResponse = async () => {
      const url = new URL(`${BACKEND_BASE}/api/sports`);
      url.searchParams.append('user_id', user.id);
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get /api/sports');
      }
      const fetchedData: SportsApiResponse = await response.json();
      // sort records ascending by time so the newest record is at the end
      fetchedData.data.sort(
        (a, b) =>
          new Date(a.timedate).getTime() - new Date(b.timedate).getTime()
      );
      setData(fetchedData);
      // Set offset to show last 5 records if available
      setPageOffset(Math.max(0, fetchedData.data.length - 5));
      setLoading(false);
    };
    fetchResponse();
  }, [user]);

  // Delete record
  const deleteRecord = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/sports/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
      // Compute new data outside state updater and update both states sequentially.
      if (!data) return;
      const newRecords = data.data.filter((item) => item.id !== id);
      setData({ data: newRecords });
      setPageOffset(Math.max(0, newRecords.length - 5));
    } catch (error) {
      setErrorMessage(`Failed to delete record: ${error}`);
      console.error(error);
    }
  };

  // Compute derived values and call hooks unconditionally
  const records = data ? data.data : [];
  const visibleRecords = records.slice(pageOffset, pageOffset + 5);

  const transitions = useTransition(visibleRecords, {
    keys: (item: Sport) => item.id,
    from: { opacity: 0, transform: 'translateY(-20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 220, friction: 20 },
  });

  const containerSpring = useSpring({
    transform: `translateX(0px)`,
    config: { tension: 220, friction: 26 },
  });

  if (loading) {
    return <Typography>Loading History</Typography>;
  }

  // Left arrow button - only if there are records to the left.
  const leftArrow =
    pageOffset > 0 ? (
      <IconButton onClick={() => setPageOffset(pageOffset - 1)} size="small">
        <ArrowBackIosIcon fontSize="small" />
      </IconButton>
    ) : null;

  const rightArrow =
    pageOffset + 5 < records.length ? (
      <IconButton onClick={() => setPageOffset(pageOffset + 1)} size="small">
        <ArrowBackIosIcon
          fontSize="small"
          sx={{ transform: 'rotate(180deg)' }}
        />
      </IconButton>
    ) : null;

  // Create an array of animated record boxes.
  const boxes = transitions((style, sport) => (
    <AnimatedBox
      key={sport.id}
      style={style}
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: theme.palette.secondary.main,
        borderRadius: '8px',
        p: 1,
        m: 1,
        minWidth: '80px',
      }}
    >
      <IconButton
        sx={{ position: 'absolute', top: 0, right: 0, p: 0.5 }}
        onClick={() => deleteRecord(sport.id)}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Typography variant="h6" align="center">
        {sport.amount}
      </Typography>
      <Typography variant="body2" align="center">
        {sport.kind}
      </Typography>
      <Typography variant="caption" align="center" display="block">
        {formatDistanceToNow(new Date(sport.timedate))}
      </Typography>
    </AnimatedBox>
  ));

  // Prepare an array of components: the left arrow (if any) first, then the record boxes.
  const components = [
    leftArrow,
    <AnimatedBox key="record-container" style={containerSpring}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>{boxes}</Box>
    </AnimatedBox>,
    rightArrow,
  ];

  return (
    <Box display="flex" alignItems="center">
      {components}
    </Box>
  );
};
