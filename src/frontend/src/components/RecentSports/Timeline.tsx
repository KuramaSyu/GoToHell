import { useState, useEffect, ReactElement } from 'react';
import {
  alpha,
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { useUserStore, useUsersStore } from '../../userStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { SportCard, SportCardNumber } from './SportCard';
import { animated, config, useTransition } from 'react-spring';
import useErrorStore from '../../zustand/Error';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { UserApi } from '../../utils/api/Api';
import { SportDialog } from './SportDialog';

export interface UserSport {
  id: number;
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
}

interface SportsApiResponse {
  data: UserSport[];
}

const AnimatedBox = animated(Box);

export const SportsTimeline = () => {
  const [data, setData] = useState<SportsApiResponse | null>(null);
  const { user } = useUserStore();
  const { users, friendsLoaded: usersLoaded } = useUsersStore();
  const { setErrorMessage } = useErrorStore();
  const { theme } = useThemeStore();
  const { refreshTrigger: ScoreRefreshTrigger } = useTotalScoreStore();
  const { refreshTrigger: RecentSportsRefreshTrigger } = useRecentSportsStore();
  const [selectedSport, setSelectedSport] = useState<UserSport | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // hook for fetching sports
  useEffect(() => {
    if (!user || !usersLoaded) return;

    const fetchSports = async () => {
      if (!user || !usersLoaded) return;
      // Include both the current user and others from the store.
      const userIds: string[] = [
        ...Object.values(users).map((u) => u.id), // friends
        user.id, // self
      ];
      try {
        await new ApiRequirementsBuilder()
          .add(ApiRequirement.User)
          .fetchIfNeeded();
        await new ApiRequirementsBuilder()
          .add(ApiRequirement.AllRecentSports)
          .forceFetch();
        const fetchedData = useRecentSportsStore.getState().recentSports;
        if (fetchedData === null) return;
        setData(fetchedData);
      } catch (error) {
        console.error(
          `Error fetching recent sports: ${error}`,
          error instanceof Error ? error.message : ''
        );
        setErrorMessage(
          `Error fetching recent sports: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    };

    // call once directly
    fetchSports();
    // TODO: totally unefficient; should use websockets
    // call every 30 seconds
    const interval = setInterval(fetchSports, 30000);

    // cleanup
    return () => clearInterval(interval);
  }, [users, ScoreRefreshTrigger, RecentSportsRefreshTrigger, user]);

  const itemsToAnimate = data?.data.toReversed() || [];
  const transition = useTransition(itemsToAnimate, {
    key: (sport) => sport.id,
    from: { opacity: 0, y: 20, scale: 0.3 },
    enter: { opacity: 1, y: 0, scale: 1 },
    leave: { opacity: 0, y: 20, scale: 0.3 },
    config: config.default,
    trail: 80,

    onRest: (_result, _ctrl, item) => {
      // after rendering the 15nth element, set
      // mount to true, that animation
      const index = Math.min(15, itemsToAnimate.length);
      if (item.id === itemsToAnimate[index]?.id) {
        setIsMounted(true);
      }
    },
  });

  if (!user || !usersLoaded) return <Box />;
  if (!data || !data.data) return <Box />;

  const timelineItems: ReactElement[] = transition((style, sport) => {
    if (sport === undefined) return null;
    const sportUser = users[sport.user_id];
    const isSelected = selectedSport?.id === sport.id;
    const isFaded = selectedSport !== null && !isSelected;

    return (
      <AnimatedBox
        key={sport.id}
        style={style}
        onClick={() => setSelectedSport(sport)}
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
          borderRadius: 5,
          cursor: 'pointer',
          // ease out: starts fast ands slow
          transition: isMounted
            ? 'opacity 0.7s ease-out, background-color 0.7s ease-out'
            : undefined,
          opacity: isFaded ? 0.3 : 1,
          '&:hover': {
            transition: 'opacity 0.2s ease-out, background-color 0.2s ease-out',
            bgcolor:
              !selectedSport || selectedSport.id === sport.id
                ? alpha(
                    blendWithContrast(theme.palette.primary.main, theme, 2 / 3),
                    1 / 4
                  )
                : undefined,
          },
        }}
      >
        <TimelineItem
          sx={{
            width: '100%',
            padding: 0,
            margin: 0,
          }}
        >
          <TimelineOppositeContent sx={{ overflow: 'hidden' }}>
            <SportCardNumber data={sport}></SportCardNumber>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot
              color="primary"
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                margin: 'auto',
              }}
            >
              <img
                src={sportUser?.getAvatarUrl()}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  objectFit: 'cover',
                }}
              />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <SportCard data={sport} />
          </TimelineContent>
        </TimelineItem>
      </AnimatedBox>
    );
  });

  return (
    <Box>
      <Timeline
        sx={{
          // weird CSS hack, to align the timeline dots left
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: '0 1 auto',
            //flex: 0,
            padding: 0,
            height: '100%',
            overflowY: 'auto',
          },
          [`& .${timelineItemClasses.root}:before`]: {
            padding: 0,
            margin: 0,
          },
        }}
      >
        {timelineItems}
      </Timeline>
      <SportDialog
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
      ></SportDialog>
    </Box>
  );
};
