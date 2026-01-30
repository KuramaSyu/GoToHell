import { useState, useEffect, ReactElement, useCallback } from 'react';
import { alpha, Box, Dialog, lighten } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { useUserStore, useUsersStore } from '../../../userStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { useRecentSportsStore } from '../../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../../zustand/TotalScoreStore';
import { SportTimelineEntry, SportCardNumber } from './SportCard';
import { animated, config, useTransition } from 'react-spring';
import useInfoStore, { SnackbarUpdateImpl } from '../../../zustand/InfoStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../../utils/api/ApiRequirementsBuilder';
import { SportDialog } from './SportDialog';
import { DiscordUserImpl } from '../../../components/DiscordLogin';
import { UserInfo } from '../../../components/UserInfo';
import { SportUserDialogWrapper } from './SportUserDialogWrapper';
import { blendAgainstContrast } from '../../../utils/blendWithContrast';

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
  const { user } = useUserStore();
  const { users, friendsLoaded: usersLoaded } = useUsersStore();
  const { setMessage } = useInfoStore();
  const { theme } = useThemeStore();
  const { refreshTrigger: ScoreRefreshTrigger } = useTotalScoreStore();
  const { refreshTrigger: RecentSportsRefreshTrigger, recentSports } =
    useRecentSportsStore();
  const [selectedSport, setSelectedSport] = useState<UserSport | null>(null);
  const [selectedUser, setSelectedUser] = useState<DiscordUserImpl | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!selectedSport || !recentSports) return;
    setSelectedSport(
      recentSports.data.find((sport) => sport.id === selectedSport.id) || null,
    );
  }, [recentSports]);

  const fetchSports = useCallback(async () => {
    if (!user || !usersLoaded) return;
    try {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .fetchIfNeeded();
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.AllRecentSports)
        .forceFetch();
      const fetchedData = useRecentSportsStore.getState().recentSports;
      if (fetchedData === null) return;
    } catch (error) {
      console.error(
        `Error fetching recent sports: ${error}`,
        error instanceof Error ? error.message : '',
      );
      setMessage(
        new SnackbarUpdateImpl(
          `Error fetching recent sports: ${error}`,
          'error',
        ),
      );
    }
  }, [user, usersLoaded, setMessage]);

  // hook for fetching sports
  useEffect(() => {
    if (!user || !usersLoaded) return;

    // call once directly
    fetchSports();

    // TODO: totally unefficient; should use websockets
    // call every 30 seconds
    const interval = setInterval(fetchSports, 30000);

    // cleanup
    return () => clearInterval(interval);
    // Update when Score increases, not when items change, since there is a artificial delay
  }, [fetchSports, ScoreRefreshTrigger, RecentSportsRefreshTrigger, users]);

  // animation for timeline items
  const itemsToAnimate = recentSports?.data.toReversed() || [];
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
      const index = Math.min(15, itemsToAnimate.length - 1);
      if (item.id === itemsToAnimate[index]?.id) {
        setIsMounted(true);
      }
    },
  });

  // early returns
  if (!user || !usersLoaded) return <Box />;
  if (!recentSports || !recentSports.data) return <Box />;

  // iterate each sport entry to build up the timeline items
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
                    theme.blendAgainstContrast('secondaryLight', 0.25),
                    0.25,
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
              color='secondary'
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                margin: 'auto',
                //color: theme.palette.secondary.main,
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
            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
          </TimelineSeparator>
          <TimelineContent>
            <SportTimelineEntry data={sport} />
          </TimelineContent>
        </TimelineItem>
      </AnimatedBox>
    );
  });

  // return timeline with previously built items
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
      {selectedSport !== null && (
        <SportUserDialogWrapper
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
        ></SportUserDialogWrapper>
      )}
    </Box>
  );
};
