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

export const TimelinePageMainComponent: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    new ApiRequirementsBuilder()
      .add(ApiRequirement.AllStreaks)
      .add(ApiRequirement.AllRecentSports)
      .add(ApiRequirement.User)
      .fetchIfNeeded();
  }, []);
  return (
    <>
      <AppBackground />
      <TimelineWrapper />
    </>
  );
};
