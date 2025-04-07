import { Box, Button, capitalize, TextField } from '@mui/material';
import React, { useState } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { getThemeNames } from '../../zustand/useThemeStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import useAppState from '../../zustand/Error';
import { Add, Remove } from '@mui/icons-material';
import { setCookie } from '../../utils/cookies';
import { CustomSelect } from './CustomSelect';
import { transform } from 'framer-motion';

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

export const GameOverrideViewmodel: React.FC<GameOverrideProps> = ({
  game,
  sport,
  amount,
}) => {
  const { setErrorMessage } = useAppState();
  const { preferences, setPreferences } = usePreferenceStore();

  const removeItem = (game: string, sport: string, amount: number) => {
    const index = preferences.game_overrides.findIndex(
      (item) =>
        item.game === game && item.sport === sport && item.amount === amount
    );
    if (index !== -1) {
      preferences.game_overrides.splice(index, 1);
      setCookie('preferences', JSON.stringify(preferences), 999);
      setPreferences(preferences);
    } else {
      setErrorMessage(
        'Could not find the game override to remove. Please try again.'
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        padding: 2,
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}
    >
      <Box sx={SX_TABLE_ENTRY}>{game}</Box>
      <Box sx={SX_TABLE_ENTRY}>{sport}</Box>
      <Box sx={SX_TABLE_ENTRY}>{amount}</Box>
      <Button
        variant="contained"
        sx={{ flex: '0 1 auto', maxWidth: 1 / 10, borderRadius: 10 }}
        onClick={() => removeItem(game, sport, amount)}
      >
        <Remove></Remove>
      </Button>
    </Box>
  );
};

export const GameOverrideList: React.FC = () => {
  const { preferences } = usePreferenceStore();
  const { sportResponse } = useSportResponseStore();

  const rows = preferences.game_overrides.map((gameOverride) => {
    return (
      <GameOverrideViewmodel
        key={gameOverride.game + gameOverride.sport}
        game={gameOverride.game}
        sport={gameOverride.sport}
        amount={gameOverride.amount}
      ></GameOverrideViewmodel>
    );
  });

  const TableHeader = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        padding: 2,
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Box sx={SX_TABLE_HEADER_ENTRY}>Game</Box>
      <Box sx={SX_TABLE_HEADER_ENTRY}>Sport</Box>
      <Box sx={SX_TABLE_HEADER_ENTRY}>Exercises per death</Box>
      <Button
        variant="contained"
        sx={{
          flex: '0 1 auto',
          maxWidth: 1 / 10,
          borderRadius: 10,
          visibility: 'hidden',
        }}
      >
        <Remove></Remove>
      </Button>
    </Box>
  );
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
        gap: 1,
      }}
    >
      {TableHeader}
      {rows}
    </Box>
  );
};

export const GameOverrideSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const { sportResponse, setSportResponse } = useSportResponseStore();
  const [game, setGame] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [exerciseAmount, setExerciseAmount] = useState<number>(0);
  const menuItems = getThemeNames();
  const { setErrorMessage } = useAppState();

  const add = () => {
    if (game === null) {
      return setErrorMessage('You need to select a game');
    }

    if (sport === null) {
      return setErrorMessage('You need to select a sport');
    }

    if (exerciseAmount === null) {
      return setErrorMessage('Well, how many exerpices per death?');
    }
    preferences.game_overrides.push({
      game: game,
      sport: sport,
      amount: exerciseAmount,
    });
    setCookie('preferences', JSON.stringify(preferences), 999);
    setPreferences(preferences);
  };

  if (!sportResponse || !sportResponse.sports) {
    return <Box sx={{ textAlign: 'center', p: 2 }}>Loading sports data...</Box>;
  }

  // make a map[str: str] for the sports
  const sports = sportResponse.sports
    ? Object.keys(sportResponse.sports).reduce((prev, current) => {
        prev[current] = current;
        return prev;
      }, {} as Record<string, string>)
    : {};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        p: 5,
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}
    >
      <CustomSelect
        items={getThemeNames().reduce((prev, current) => {
          prev[current] = current;
          return prev;
        }, {} as Record<string, string>)}
        label="Game"
        value={game ?? ''}
        onChange={setGame}
      ></CustomSelect>
      <CustomSelect
        items={sports}
        label="Sport"
        value={sport ?? ''}
        onChange={setSport}
      ></CustomSelect>
      <TextField
        sx={{ flex: 1 }}
        variant="outlined"
        type="number"
        label="Exercises per death"
        value={exerciseAmount}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          if (!isNaN(value) && value >= 0) {
            setExerciseAmount(Number(value));
          } else {
            setExerciseAmount(0);
          }
        }}
      ></TextField>
      <Button
        onClick={add}
        variant="contained"
        sx={{ flex: '0 1 auto', maxWidth: 1 / 10 }}
      >
        <Add />
      </Button>
    </Box>
  );
};
