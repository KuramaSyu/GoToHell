import {
  Autocomplete,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { SportEntry } from '../MainPage/QuickActions/SearchEntry';
import { useMemo, useState } from 'react';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { getThemeNames } from '../../zustand/useThemeStore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import { isNumeric } from '../../utils/UserNumber';

type GameOverrideProps = {
  game: string;
  sport: string;
  amount: number;
};

const SX_TABLE_ENTRY = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
};

const SX_TABLE_HEADER_ENTRY = {
  fontSize: '20px',
  textTransform: 'uppercase',
  fontWeight: '300',
  ...SX_TABLE_ENTRY,
};

/**
 * function which uses usePreferenceStore to reset game overrides
 */
export function resetGameOverrideSettingsLogic() {
  const preferences = usePreferenceStore.getState().preferences;
  preferences.game_overrides = [];
  usePreferenceStore.getState().setPreferences(preferences);
}

/**
 * Displays a table where the user can add simple exercise overrides, like "1 push-up per death in Dark Souls". T
 * his is for users who want simple, strict rules
 */
export const GameOverrideSettings: React.FC = () => {
  const { setMessage } = useInfoStore();
  const { preferences, setPreferences } = usePreferenceStore();
  const [game, setGame] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState('0');

  const removeItem = (game: string, sport: string, amount: number) => {
    const index = preferences.game_overrides.findIndex(
      (item) =>
        item.game === game && item.sport === sport && item.amount === amount,
    );
    if (index !== -1) {
      preferences.game_overrides.splice(index, 1);
      setPreferences(preferences);
    } else {
      setMessage(
        new SnackbarUpdateImpl(
          'Could not find the game override to remove. Please try again.',
          'error',
        ),
      );
    }
  };

  // sport entries to get display names
  const sportEntries: Map<string, SportEntry> = useMemo(() => {
    const sports = new Map();

    Object.keys(useSportResponseStore.getState().sportResponse.sports).map(
      (sport) => sports.set(sport, new SportEntry(sport)),
    );
    return sports;
  }, []);

  // returns the entry name (e.g. "pushup") for a given display name (e.g. "Push-Up")
  const getEntryNameByDisplayName = (displayName: string): string | null => {
    const entry = Array.from(sportEntries.values()).find(
      (x) => x.displayName() === displayName,
    );
    return entry ? entry.name : null;
  };

  const themeNames = getThemeNames();

  const isEverythingSelected = () => {
    return (
      game !== null &&
      sport !== null &&
      amountStr !== '' &&
      isNumeric(amountStr)
    );
  };

  const addOverride = () => {
    if (game === null) {
      return setMessage(
        new SnackbarUpdateImpl('You need to select a game', 'error'),
      );
    }

    if (sport === null) {
      return setMessage(
        new SnackbarUpdateImpl('You need to select a sport', 'error'),
      );
    }

    if (!isNumeric(amountStr)) {
      return setMessage(
        new SnackbarUpdateImpl(
          'Please enter a valid number for the exercise amount.',
          'error',
        ),
      );
    }
    preferences.game_overrides.push({
      game: game,
      sport: sport,
      amount: parseInt(amountStr),
    });
    setPreferences(preferences);
  };

  return (
    <Stack direction='column' gap={2} mb={10}>
      <Typography variant='body1'>
        If you want simple, strict rules, like 1 push-up per death, then you can
        set them up here. Additionally you need to specify, for which game to
        enable such a rule
      </Typography>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant='h6'>Amount of Exercise</Typography>
              </TableCell>
              <TableCell>
                <Typography variant='h6'>Exercise</Typography>
              </TableCell>
              <TableCell>
                <Typography variant='h6'>Game</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {preferences.game_overrides.map((gameOverride) => (
              //   <GameOverrideViewmodel
              //     key={gameOverride.game + gameOverride.sport}
              //     game={gameOverride.game}
              //     sport={gameOverride.sport}
              //     amount={gameOverride.amount}
              //   ></GameOverrideViewmodel>

              <TableRow
                key={gameOverride.game + gameOverride.sport}
                sx={{
                  '& .delete-button': { visibility: 'hidden' },
                  '&:hover .delete-button': { visibility: 'visible' },
                }}
              >
                <TableCell>
                  <Typography>{gameOverride.amount}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {sportEntries.get(gameOverride.sport)?.displayName() ??
                      'unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack
                    direction='row'
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography>{gameOverride.game}</Typography>
                    <IconButton
                      className='delete-button'
                      color='error'
                      onClick={() =>
                        removeItem(
                          gameOverride.game,
                          gameOverride.sport,
                          gameOverride.amount,
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell>
                <Stack direction='row' gap={2}>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    disabled={!isEverythingSelected()}
                    onClick={() => addOverride()}
                  >
                    <Typography>Add</Typography>
                  </Button>
                  <TextField
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    id='outlined-basic'
                    label='Amount'
                    type='number'
                    variant='outlined'
                    helperText={
                      !isNumeric(amountStr) ? 'e.g. 30, 2, or 42' : null
                    }
                    error={!isNumeric(amountStr)}
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Autocomplete
                  value={sport}
                  onChange={(_, newValue) => {
                    setSport(getEntryNameByDisplayName(newValue || ''));
                  }}
                  disablePortal
                  options={Array.from(sportEntries.values()).map((e) =>
                    e.displayName(),
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label='Select a Sport' />
                  )}
                />
              </TableCell>
              <TableCell>
                <Autocomplete
                  value={game}
                  onChange={(_, newValue) => {
                    setGame(newValue);
                  }}
                  disablePortal
                  options={themeNames}
                  renderInput={(params) => (
                    <TextField {...params} label='Select a Game' />
                  )}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
