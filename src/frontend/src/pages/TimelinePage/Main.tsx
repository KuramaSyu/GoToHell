import { Timeline } from '@mui/icons-material';
import { useThemeStore } from '../../zustand/useThemeStore';
import { SportsTimeline } from '../MainPage/RecentSports/Timeline';
import { TimelineWrapper } from '../MainPage/RecentSports/TimelineWrapper';
import AppBackground from '../../components/AppBackground';
import { useEffect } from 'react';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { Box } from '@mui/material';
import { useLoadingStore } from '../../zustand/loadingStore';
import { set } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { Pages } from '../../components/TopBar';

export const TimelinePageMainComponent: React.FC = () => {
  const { theme } = useThemeStore();
  const { isLoading, setLoading } = useLoadingStore();
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedRight: () => navigate(Pages.HOME),
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .fetchIfNeeded();

      await new ApiRequirementsBuilder()
        .add(ApiRequirement.AllStreaks)
        .add(ApiRequirement.AllRecentSports)
        .forceFetch();

      setLoading(false);
    }
    init();
    return () => setLoading(false);
  }, []);
  return (
    <>
      <AppBackground />
      <Box {...handlers} sx={{ height: '100%', overflowY: 'auto' }}>
        <TimelineWrapper />
      </Box>
    </>
  );
};
