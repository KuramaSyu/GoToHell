import {
  Box,
  Button,
  Grid,
  Input,
  OutlinedInput,
  Paper,
  TableContainer,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { usePersonalGoalsStore } from '../../zustand/PersonalGoalsStore';
import { Grid4x4 } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { isNumeric } from '../../utils/UserNumber';
import { useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { SportEntry } from '../MainPage/QuickActions/SearchEntry';
import {
  GoalFrequency,
  PersonalGoalApi,
} from '../../utils/api/PersonalGoalsApi';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';
import DeleteIcon from '@mui/icons-material/Delete';

export const PersonalGoalSettings: React.FC = () => {
  const { personalGoalsList } = usePersonalGoalsStore();
  const [amountStr, setAmountStr] = useState('1');
  const { sportResponse } = useSportResponseStore();
  const [frequency, setFrequency] = useState<GoalFrequency>('daily');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const { setMessage } = useInfoStore();
  const sportEntries: Map<string, SportEntry> = useMemo(() => {
    const sports = new Map();

    Object.keys(sportResponse.sports).map((sport) =>
      sports.set(sport, new SportEntry(sport)),
    );
    return sports;
  }, []);

  const isEverythingSelected = (): Boolean => {
    return Number(amountStr) > 0 && selectedSport !== null;
  };

  const uploadDailyGoal = () => {
    if (!isEverythingSelected()) {
      return;
    }
    const sport = Array.from(sportEntries.values()).find(
      (x) => x.displayName() === selectedSport,
    );
    if (sport === undefined) {
      setMessage(new SnackbarUpdateImpl('Sport not found', 'error'));
      return;
    }
    new PersonalGoalApi()
      .post(sport.name, Number(amountStr), frequency)
      .then(() =>
        setMessage(new SnackbarUpdateImpl('Added new Personal Goal', 'info')),
      )
      .catch((e) =>
        setMessage(
          new SnackbarUpdateImpl(
            `Adding Personal Goal failed: ${String(e)}`,
            'error',
          ),
        ),
      );
  };

  const deleteDailyGoal = (id: string) => {
    new PersonalGoalApi()
      .delete(id)
      .catch((e) =>
        setMessage(
          new SnackbarUpdateImpl(`Failed to delete Goal: ${JSON.stringify(e)}`),
        ),
      );
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant='h6'>Exercises</Typography>
            </TableCell>
            <TableCell>
              <Typography variant='h6'>Sport</Typography>
            </TableCell>
            <TableCell>
              <Typography variant='h6'>Frequency</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {personalGoalsList.map((goal) => (
            <TableRow
              sx={{
                '& .delete-button': { visibility: 'hidden' },
                '&:hover .delete-button': { visibility: 'visible' },
              }}
            >
              <TableCell>
                <Typography>{goal.amount}</Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  {sportEntries.get(goal.sport)?.displayName() ?? 'unknown'}
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
                  <Typography>{goal.frequency}</Typography>
                  <IconButton
                    className='delete-button'
                    color='error'
                    onClick={() => deleteDailyGoal(goal.id)}
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
                  onClick={() => uploadDailyGoal()}
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
                value={selectedSport}
                onChange={(_, newValue) => {
                  setSelectedSport(newValue || '');
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
                value={frequency}
                onChange={(_, newValue) => {
                  setFrequency((newValue as GoalFrequency) || 'daily');
                }}
                disablePortal
                options={['daily', 'weekly', 'monthly']}
                renderInput={(params) => (
                  <TextField {...params} label='Select a frequency' />
                )}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
