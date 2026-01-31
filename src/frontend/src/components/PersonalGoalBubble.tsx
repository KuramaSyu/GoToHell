import { ReactElement, useMemo, useState } from 'react';
import { usePersonalGoalsStore } from '../zustand/PersonalGoalsStore';
import {
  DefaultPersonalGoalCalculator,
  IPersonalGoalCalculator,
} from '../utils/PersonalGoalCalculator';
import {
  Box,
  Button,
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
import { BoxElevation0, BoxElevation1, BoxElevation2 } from '../theme/statics';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import FlagIcon from '@mui/icons-material/Flag';
import TimerIcon from '@mui/icons-material/Timer';

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
    <Paper
      sx={{
        py: 2,
        px: 2,
        width: 'clamp(400px, 33vw, 700px)',
      }}
      elevation={24}
    >
      <Stack direction={'column'} gap={2} alignItems={'center'} width={'100%'}>
        <Typography variant='h5' textTransform={'uppercase'}>
          Goals
        </Typography>
        {personalGoalsList.length > 0 ? (
          personalGoalsList.map((g) => (
            <PersonalGoalCard
              goal={g}
              percentageDone={calculator.calculatePercentageDone(
                g,
                recentSports?.data ?? [],
              )}
              lastPossibleTime={calculator.getLastPossibleTime(g)}
              exercisesRemaining={
                g.amount -
                calculator.calculateExercisesDone(g, recentSports?.data ?? [])
              }
            />
          ))
        ) : (
          <GoToSettingsButton />
        )}
      </Stack>
    </Paper>
  );
};

interface PersonalGoalCardProps {
  goal: PersonalGoalData;
  percentageDone: number;
  lastPossibleTime: Date;
  exercisesRemaining: number;
}
const PersonalGoalCard: React.FC<PersonalGoalCardProps> = ({
  goal,
  percentageDone,
  lastPossibleTime,
  exercisesRemaining,
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

  const icon = SearchEntryIconProvider.getIcon(entry, {
    height: 48,
    width: 48,
  });

  return (
    <Paper
      elevation={10}
      sx={{
        py: 1,
        px: 2,
        background: `linear-gradient(to right, ${theme.palette.secondary.main} ${percentageDone * 100}%, ${theme.palette.background.paper} ${percentageDone * 100}%)`,
        borderRadius: theme.shape.borderRadius,
        width: '100%',
      }}
    >
      <Stack direction={'row'} gap={2} alignItems={'center'} width={'100%'}>
        {icon}

        <Stack direction={'column'} alignItems={'center'} flexGrow={1}>
          <Typography variant='h6'>
            {`${goal.amount} ${GameSelectionMap.get(goal.sport)} ${durationString[goal.frequency]}`}
          </Typography>
          <Typography variant='body1'>
            {`Remaining: ${exercisesRemaining} ${GameSelectionMap.get(goal.sport)} in ${formatDistanceToNow(lastPossibleTime, { includeSeconds: true })}`}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

const GoToSettingsButton: React.FC = () => {
  // add /settings-v2 navigation
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  return (
    <Stack alignItems={'center'}>
      <Typography variant='h6'>
        Seems like you haven't added any Goals. Go to <SettingsIcon /> Settings
        &rarr; <FlagIcon />
        Personal Goals
      </Typography>
      {/* <Button
        onClick={() => navigate('/settings-v2')}
        variant='contained'
        sx={{ fontSize: theme.typography.h5.fontSize, mt: 1 }}
      >
        Go to Settings
      </Button> */}
    </Stack>
  );
};
