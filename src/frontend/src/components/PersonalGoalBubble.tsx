import { ReactElement, useMemo, useState } from 'react';
import { usePersonalGoalsStore } from '../zustand/PersonalGoalsStore';
import {
  DefaultPersonalGoalCalculator,
  IPersonalGoalCalculator,
} from '../utils/PersonalGoalCalculator';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useSportResponseStore } from '../zustand/sportResponseStore';
import {
  SearchEntry,
  SportEntry,
} from '../pages/MainPage/QuickActions/SearchEntry';
import { PersonalGoalData } from '../utils/api/responses/PersonalGoals';
import { GameSelectionMap } from '../utils/data/Sports';
import { useRecentSportsStore } from '../zustand/RecentSportsState';
import { SearchEntryIconProvider } from '../pages/MainPage/QuickActions/SearchEntryIconProvider';
import { en } from 'zod/v4/locales';
import { useThemeStore } from '../zustand/useThemeStore';
import { BoxElevation1, BoxElevation2 } from '../theme/statics';
import { formatDistanceToNow } from 'date-fns';

export const PersonalGoalBubble = () => {
  const { personalGoalsList } = usePersonalGoalsStore();
  const { sportResponse } = useSportResponseStore();
  const [calculator, setCalculator] = useState<IPersonalGoalCalculator>(
    new DefaultPersonalGoalCalculator(),
  );
  const { recentSports } = useRecentSportsStore();
  const { theme } = useThemeStore();

  // creates a map which mapps sport name to the sport entry
  // only contains sports, where user has a goal for
  const sports: Map<string, SearchEntry> = useMemo(() => {
    return Object.keys(sportResponse.sports)
      .filter((s) => personalGoalsList.map((g) => g.sport).find((x) => x === s))
      .map((s) => new SportEntry(s))
      .reduce((map, entry) => {
        return map.set(entry.name, entry);
      }, new Map<string, SearchEntry>());
  }, [sportResponse, personalGoalsList]);

  return (
    <Box
      sx={{
        ...BoxElevation1(theme),
        py: 2,
        px: 2,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Stack direction={'row'}>
        {personalGoalsList.map((g) => (
          <PersonalGoalCard
            goal={g}
            percentageDone={calculator.calculatePercentageDone(
              g,
              recentSports?.data ?? [],
            )}
            lastPossibleTime={calculator.getLastPossibleTime(g)}
          />
        ))}
      </Stack>
    </Box>
  );
};

interface PersonalGoalCardProps {
  goal: PersonalGoalData;
  percentageDone: number;
  lastPossibleTime: Date;
}
const PersonalGoalCard: React.FC<PersonalGoalCardProps> = ({
  goal,
  percentageDone,
  lastPossibleTime,
}) => {
  const { theme } = useThemeStore();
  const durationString: Record<string, string> = {
    daily: 'each day',
    weekly: 'each week',
    monthly: 'each month',
  };
  const entry = useSportResponseStore
    .getState()
    .getSportEntryMap()
    .get(goal.sport);

  if (!entry) {
    return null;
  }

  const icon = SearchEntryIconProvider.getIcon(entry);

  return (
    <Paper
      elevation={10}
      sx={{
        py: 1,
        px: 2,
        background: `linear-gradient(to right, ${theme.palette.secondary.main} ${percentageDone * 100}%, ${theme.palette.background.paper} ${percentageDone * 100}%)`,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Stack direction={'column'} alignItems={'center'}>
        <Stack direction={'row'} gap={1}>
          {icon}
          <Typography variant='h6'></Typography>
          <Typography variant='h6'>
            {`${goal.amount} ${GameSelectionMap.get(goal.sport)} ${durationString[goal.frequency]}`}
          </Typography>
        </Stack>
        <Typography variant='body1'>
          {`${formatDistanceToNow(lastPossibleTime, { includeSeconds: true })} left`}
        </Typography>
      </Stack>
    </Paper>
  );
};
