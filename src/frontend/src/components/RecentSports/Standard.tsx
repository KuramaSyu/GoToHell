import { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CloseIcon from '@mui/icons-material/Close';
import { useSpring, useTransition, animated } from 'react-spring';
import { BACKEND_BASE } from '../../statics';
import { useUsersStore, useUserStore } from '../../userStore';
import { formatDistanceToNow } from 'date-fns';
import { useThemeStore } from '../../zustand/useThemeStore';
import useAppState from '../../zustand/Error';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { Sport, SportsApiResponse } from '../../models/Sport';

const AnimatedBox = animated(Box);

export const RecentSportsStandard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [pageOffset, setPageOffset] = useState<number>(0);
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const { setErrorMessage } = useAppState();
  const { refreshTrigger, setRecentSports, recentSports } =
    useRecentSportsStore();
  const { users } = useUsersStore();

  useEffect(() => {
    if (!user) return;
    const fetchResponse = async () => {
      const url = new URL(`${BACKEND_BASE}/api/sports`);
      // creat an array with the users id
      const userIds: string[] = [user.id];

      url.searchParams.append('user_ids', userIds.join(','));
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get /api/sports');
      }
      const fetchedData: SportsApiResponse = await response.json();
      // Sort records ascending by time so the newest is at the end.
      fetchedData.data.sort(
        (a, b) =>
          new Date(a.timedate).getTime() - new Date(b.timedate).getTime()
      );
      setRecentSports(fetchedData);
      // Set offset to show the last 5 records if available.
      setPageOffset(Math.max(0, fetchedData.data.length - 5));
      setLoading(false);
    };
    fetchResponse();
  }, [user, refreshTrigger, users]);

  const deleteRecord = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/sports/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
      if (!recentSports) return;
      // update recent sports by filtering out the deleted one
      const filteredRecords = recentSports.data.filter(
        (item) => item.id !== id
      );
      setPageOffset(Math.max(0, filteredRecords.length - 5));
      setRecentSports({ ...recentSports, data: filteredRecords });
      // Trigger total score refresh.
      useTotalScoreStore.getState().triggerRefresh();
    } catch (error) {
      setErrorMessage(`Failed to delete record: ${error}`);
      console.error(error);
    }
  };

  const records = recentSports ? recentSports.data : [];
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

  if (!user) {
    return <Box></Box>;
  }
  if (loading) {
    return <Typography>Loading History</Typography>;
  }

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

  return (
    <Box display="flex" alignItems="center">
      {leftArrow}
      <AnimatedBox style={containerSpring}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>{boxes}</Box>
      </AnimatedBox>
      {rightArrow}
    </Box>
  );
};
