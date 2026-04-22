import {
  useState,
  useEffect,
  ReactElement,
  useCallback,
  useMemo,
  memo,
  useRef,
} from 'react';
import { RecentSportsAggregator } from '../../../utils/RecentSportsAggregator';
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
import {
  SportTimelineEntry,
  SportCardNumber,
  SportGroupTimelineEntry,
  SportGroupCardNumber,
} from './SportCard';
import {
  UserSport,
  UserSportGroup,
  UserSportGroupModel,
} from './models/SportModels';
import { animated, config, useTransition } from 'react-spring';
import useInfoStore, { SnackbarUpdateImpl } from '../../../zustand/InfoStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../../utils/api/ApiRequirementsBuilder';
import { SportDialog } from './SportDialog';
import { DiscordUserImpl } from '../../../components/DiscordLogin';
import { SportUserDialogWrapper } from './SportUserDialogWrapper';
import { blendAgainstContrast } from '../../../utils/blendWithContrast';
import { UserApi } from '../../../utils/api/Api';

// moved models to ./models/SportModels

interface SportsApiResponse {
  data: UserSport[];
}

const AnimatedBox = animated(Box);

// perf: memoize timeline items
const MemoizedSportCardNumber = memo(SportCardNumber);
const MemoizedSportTimelineEntry = memo(SportTimelineEntry);
const MemoizedSportGroupCardNumber = memo(SportGroupCardNumber);
const MemoizedSportGroupTimelineEntry = memo(SportGroupTimelineEntry);
const MemoizedUserDialogWrapper = memo(SportUserDialogWrapper);

export const SportsTimeline = () => {
  const { user } = useUserStore();
  const { users, friendsLoaded: usersLoaded } = useUsersStore();
  const { setMessage } = useInfoStore();
  const { theme } = useThemeStore();
  const { refreshTrigger: ScoreRefreshTrigger } = useTotalScoreStore();
  const { refreshTrigger: RecentSportsRefreshTrigger, recentSports } =
    useRecentSportsStore();
  const [selectedSport, setSelectedSport] = useState<
    UserSport | UserSportGroup | null
  >(null);
  const [isMounted, setIsMounted] = useState(false);
  const timelineSentinelRef = useRef<HTMLDivElement>(null);
  const currentOffset = useRef(0);
  const isLoadingMoreItems = useRef(false);

  const recentGroupedSports: Array<UserSport | UserSportGroup> = useMemo(() => {
    if (!recentSports || !recentSports.data) return [];
    return RecentSportsAggregator.builder()
      .allowDifferentGames(true)
      .allowDifferentKinds(false)
      .aggregate(recentSports.data);
  }, [recentSports]);

  useEffect(() => {
    if (!selectedSport || !recentSports) return;
    // Only try to refresh when a single sport is selected (not a group)
    if ('id' in selectedSport) {
      setSelectedSport(
        recentSports.data.find((sport) => sport.id === selectedSport.id) ||
          null,
      );
    }
  }, [recentSports]);

  // load more sports when end is reached
  const onScrollToEnd = useCallback(() => {
    const currentSports = useRecentSportsStore.getState().recentSports;
    if (
      isLoadingMoreItems.current === true &&
      currentOffset.current < (recentSports?.data.length ?? 0)
    ) {
      console.log(`timeline end reached: already fetching`);
      return;
    }

    isLoadingMoreItems.current = true;
    // Get fresh data from store instead of using stale closure

    currentOffset.current = currentSports?.data.length ?? 1;

    console.log(
      `timeline end reached: fetching sports with offset ${currentOffset.current}`,
    );
    new UserApi()
      .fetchAllRecentSports(currentOffset.current, 100)
      .finally(() => {
        isLoadingMoreItems.current = false;
      });
  }, []);

  // watch until end of timeline is reached and in this case trigger onScrollToEnd()
  useEffect(() => {
    const sentinel = timelineSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          onScrollToEnd();
        }
      },
      {
        threshold: 0.01, // Trigger when 1% of sentinel is visible
        rootMargin: '0px 0px 50px 0px', // Trigger 50px before actual end
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [onScrollToEnd]);

  /** fetches sports from backend */
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

  // animation for timeline items (supports grouped items)
  const itemsToAnimate = recentGroupedSports
    ? [...recentGroupedSports].reverse()
    : [];

  // perf: memoize transition config
  const transitionConfig = useMemo(
    () => ({
      key: (sport: any) =>
        'id' in sport
          ? sport.id
          : `group-${sport.entries?.length}-${sport.entries?.[0]?.timedate ?? ''}`,
      from: { opacity: 0, y: 20, scale: 0.3 },
      enter: { opacity: 1, y: 0, scale: 1 },
      leave: { opacity: 0, y: 20, scale: 0.3 },
      config: config.default,
      trail: 80,

      onRest: (_result, _ctrl, item: any) => {
        const makeKey = (s: any) =>
          'id' in s
            ? s.id
            : `group-${s.entries?.length}-${s.entries?.[0]?.timedate ?? ''}`;
        const index = Math.min(15, itemsToAnimate.length - 1);
        if (makeKey(item) === makeKey(itemsToAnimate[index])) {
          setIsMounted(true);
        }
      },
    }),
    [itemsToAnimate.length],
  );
  const transition = useTransition(itemsToAnimate, transitionConfig as any);

  // perf: memoize hover styles to prevent recreations
  const getHoverStyles = useCallback(
    (sport: any) => {
      const first = sport.entries ? sport.entries[0] : sport;
      let isSelected = false;
      if (!selectedSport) isSelected = true;
      else if ('id' in selectedSport)
        isSelected = selectedSport.id === first?.id;
      else if (selectedSport.entries)
        isSelected = selectedSport.entries.some((e: any) => e.id === first?.id);
      return {
        transition: 'opacity 0.2s ease-out, background-color 0.2s ease-out',
        bgcolor: isSelected
          ? alpha(theme.blendAgainstContrast('secondaryLight', 0.25), 0.25)
          : undefined,
      };
    },
    [selectedSport, theme],
  );

  // early returns
  if (!user || !usersLoaded) return <Box />;
  if (!recentSports || !recentSports.data) return <Box />;

  // iterate each sport entry to build up the timeline items
  const timelineItems: ReactElement[] = transition((style, sport: any) => {
    if (sport === undefined) return null;
    const isGroup = sport.entries !== undefined;
    const firstEntry = isGroup ? sport.entries[0] : sport;
    const sportUser = users[firstEntry.user_id];
    let isSelected = false;
    if (selectedSport) {
      if ('id' in selectedSport)
        isSelected = selectedSport.id === firstEntry?.id;
      else if (selectedSport.entries)
        isSelected = selectedSport.entries.some(
          (e: any) => e.id === firstEntry?.id,
        );
    }
    const isFaded = selectedSport !== null && !isSelected;
    const itemKey =
      'id' in sport
        ? sport.id
        : `group-${sport.entries?.length}-${sport.entries?.[0]?.timedate ?? ''}`;

    return (
      <AnimatedBox
        key={itemKey}
        style={style}
        onClick={() => setSelectedSport(sport)}
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
          borderRadius: 1,
          cursor: 'pointer',
          // ease out: starts fast ands slow
          transition: isMounted
            ? 'opacity 0.7s ease-out, background-color 0.7s ease-out'
            : undefined,
          opacity: isFaded ? 0.3 : 1,
          '&:hover': getHoverStyles(sport),
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
            {isGroup ? (
              <MemoizedSportGroupCardNumber data={sport} />
            ) : (
              <MemoizedSportCardNumber data={sport} />
            )}
          </TimelineOppositeContent>
          <TimelineSeparator
            sx={{ transition: theme.colorTransition.root.transition }}
          >
            <TimelineDot
              color='secondary'
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                margin: 'auto',
                transition: theme.colorTransition.root.transition,
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
            {isGroup ? (
              <MemoizedSportGroupTimelineEntry data={sport} />
            ) : (
              <MemoizedSportTimelineEntry data={sport} />
            )}
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

        {/* extra element which is a detector/sentinel to track the end of the timeline */}
        <div
          ref={timelineSentinelRef}
          style={{
            height: '1px',
            backgroundColor: 'transparent',
            width: '100%',
          }}
        />
      </Timeline>
      {selectedSport !== null && (
        <MemoizedUserDialogWrapper
          selectedSport={selectedSport as any}
          setSelectedSport={setSelectedSport as any}
        />
      )}
    </Box>
  );
};
