import { useThemeStore } from '../../zustand/useThemeStore';
import { SportsTimeline } from '../MainPage/RecentSports/Timeline';

export const MobileTimeline: React.FC = () => {
  const { theme } = useThemeStore();

  return <SportsTimeline />;
};
