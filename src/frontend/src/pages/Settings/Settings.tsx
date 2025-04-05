import {
  Box,
  Button,
  CssBaseline,
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { UserPreferences } from '../../models/Preferences';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { getThemeNames } from '../../zustand/useThemeStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import AppBackground from '../../components/AppBackground';
import { GetSportsResponse } from '../../models/Sport';
import useAppState from '../../zustand/Error';

type CustomSelectProps = {
  items: Record<string, string>;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  items,
  label,
  value,
  onChange,
}) => {
  return (
    <FormControl variant="outlined" sx={{ flex: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        {Object.entries(items).map(([display, val]) => (
          <MenuItem key={val} value={val}>
            {display}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const MultiplierSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  var multipliers = [];
  // iterate andcreate flex colums
  return <Box sx={{ display: 'flex', flexDirection: 'row' }}></Box>;
};

export const GameOverrideSettings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const { sportResponse, setSportResponse } = useSportResponseStore();
  const [game, setGame] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const menuItems = getThemeNames();
  const { setErrorMessage } = useAppState();
  const add = () => {};
  if (sportResponse == null) {
    return null;
  }

  const sports = sportResponse.sports
    ? Object.keys(sportResponse.sports).reduce((prev, current) => {
        prev[current] = current;
        return prev;
      }, {} as Record<string, string>)
    : {};
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
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
        required={true}
        type="number"
        label="Exercises per death"
      ></TextField>
      <Button
        onClick={add}
        variant="contained"
        sx={{ flex: '0 1 auto', width: 1 / 8 }}
      >
        Add
      </Button>
    </Box>
  );
};

export const Settings: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setPreferences({
      ...preferences,
      [name as string]: value,
    });
  };
  return (
    <>
      <AppBackground></AppBackground>
      <CssBaseline></CssBaseline>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Grid with multipliers */}
        <Box sx={{ width: 4 / 5, flex: '0 1 auto', justifyItems: 'center' }}>
          <GameOverrideSettings />
        </Box>
        {/* Grid with game overrides */}
        <MultiplierSettings />
      </Box>
    </>
  );
};
