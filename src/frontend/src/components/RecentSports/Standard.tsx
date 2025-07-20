import { useState, useEffect } from 'react';
import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CloseIcon from '@mui/icons-material/Close';
import { useSpring, useTransition, animated } from 'react-spring';
import { BACKEND_BASE } from '../../statics';
import { useUsersStore, useUserStore } from '../../userStore';
import { formatDistanceToNow } from 'date-fns';
import { useThemeStore } from '../../zustand/useThemeStore';
import useInfoStore from '../../zustand/InfoStore';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import {
  useRecentSportsStore,
  useYourRecentSportsStore,
} from '../../zustand/RecentSportsState';
import { Sport, SportsApiResponse } from '../../models/Sport';
import { flushSync } from 'react-dom';
import { UserApi } from '../../utils/api/Api';
import { Api } from '@mui/icons-material';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';

const AnimatedBox = animated(Box);

export interface RecentSportStandardProps {
  this_tab: number;
  current_tab: number;
}
export const RecentSportsStandard: React.FC<RecentSportStandardProps> = ({
  this_tab,
  current_tab,
}) => {
  const { theme } = useThemeStore();

  // number of items by display size
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  var numberItems = 3;
  if (isLgUp) {
    numberItems = 4;
  }
  if (isXlUp) {
    numberItems = 5;
  }

  // use react mediaquery to get the current display
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUserStore();
  const { setMessage: setErrorMessage } = useInfoStore();
  const {
    refreshTrigger,
    setRecentSports: setAllRecentSports,
    recentSports: allRecentSports,
  } = useRecentSportsStore();
  const [recentSports, setRecentSports] = useState<SportsApiResponse | null>(
    null
  );
  const { users } = useUsersStore();

  const getOffset = (recentSports: SportsApiResponse | null) => {
    if (recentSports && recentSports.data) {
      return Math.max(0, recentSports.data.length - numberItems);
    }
    return 0;
  };

  const [pageOffset, setPageOffset] = useState<number>(getOffset(recentSports));

  // update recentSports, when item was added to timeline
  useEffect(() => {
    if (
      user === null ||
      allRecentSports === undefined ||
      allRecentSports?.data === null
    )
      return;

    const sortedApiResponse = {
      data: allRecentSports!.data.filter((v) => v.user_id === user.id),
    };
    setRecentSports(sortedApiResponse);
    setPageOffset(getOffset(sortedApiResponse));
  }, [allRecentSports]);

  // startup and update useEffect
  useEffect(() => {
    if (!user) return;
    if (current_tab !== this_tab) return;
    console.log(`call useffect loading: ${loading}`);
    const fetchResponse = async () => {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.YourRecentSports)
        .fetchIfNeeded();

      setPageOffset(
        getOffset(useYourRecentSportsStore.getState().recentSports)
      );
      setLoading(false);

      // Set offset to show the last 5 records if available.
    };
    fetchResponse();
  }, [user, refreshTrigger, users]);

  useEffect(() => {
    return () => {
      console.log('cleanup');
      setPageOffset(0);
      setLoading(true);
    };
  }, []);

  const deleteRecord = async (id: number) => {
    try {
      const response = await new UserApi().deleteRecord(id);
      if (response === null) {
        throw new Error('Failed to delete record');
      }
      if (!recentSports) return;
      // update recent sports by filtering out the deleted one
      const filteredRecords = recentSports.data.filter(
        (item) => item.id !== id
      );
      setPageOffset(Math.max(0, filteredRecords.length - numberItems));
      setRecentSports({ ...recentSports, data: filteredRecords });
      // Trigger total score refresh.
      useTotalScoreStore.getState().triggerRefresh();
    } catch (error) {
      setErrorMessage({
        message: `Failed to delete record: ${error}`,
        severity: 'error',
      });
      console.error(error);
    }
  };

  const records = recentSports ? recentSports.data : [];

  const visibleRecords = records.slice(pageOffset, pageOffset + numberItems);

  const containerSpring = useSpring({
    transform: `translateX(5px)`,
    config: { tension: 220, friction: 26 },
  });

  const transitions = useTransition(visibleRecords, {
    keys: (item: Sport) => item.id,
    from: { opacity: 0, transform: 'translateY(-20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    //leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 220, friction: 20 },
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
