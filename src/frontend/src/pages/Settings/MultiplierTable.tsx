import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import EditableNumberTable, {
  EditableTableColumn,
  TableDataRow,
} from './EditableTable';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import useCalculatorStore from '../../zustand/CalculatorStore';
import Latex from 'react-latex-next';
import { Multiplier, UserPreferences } from '../../models/Preferences';
import { PreferenceRespectingDefaultSportsCalculator } from '../../utils/SportCalculator';
import { buildDecoratorStack } from '../../components/SportSelect';
import { useThemeStore } from '../../zustand/useThemeStore';

const getBaseColumns = (): EditableTableColumn[] => {
  return [
    {
      id: 'sport',
      label: 'Sport',
      isEditable: false,
    },
    {
      id: 'multiplier',
      label: 'SportBase',
      isEditable: true,
    },
  ];
};

export const MultiplierTable: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const { theme } = useThemeStore();
  const { sportResponse, setSportResponse, emptySportsResponse } =
    useSportResponseStore();
  const [data, setData] = useState<TableDataRow[]>([{ id: 0, key: 'test' }]);
  const [calculator, setCalculator] = useState(
    buildDecoratorStack(sportResponse, preferences, theme.custom.themeName)
  );
  const [columns, setColumns] = useState<EditableTableColumn[]>(
    getBaseColumns()
  );

  useEffect(() => {
    console.log(`sport Response: ${JSON.stringify(sportResponse)}`);
    setCalculator(
      buildDecoratorStack(sportResponse, preferences, theme.custom.themeName)
    );
  }, [preferences, sportResponse]);

  /**
   *
   */
  const calculateGameCells = (sport: string): Record<string, number> => {
    const multiplier = calculator.get_sport_base(sport);
    const DEATHS = 10;
    const games = preferences.ui.displayedGames;
    return (
      games?.reduce(
        (prev, current) => ({
          ...prev,
          [current]: Math.round(
            calculator.calculate_amount(sport, current, DEATHS)
          ),
        }),
        {}
      ) ?? {}
    );
  };

  // add games to columns when preferences are loaded
  useEffect(() => {
    const gameColumns = preferences.ui.displayedGames
      ?.reduce<EditableTableColumn[]>(
        (prev, current) => [
          ...prev,
          { id: current, label: current.toUpperCase(), isEditable: false },
        ],
        []
      )
      .filter((x) => x.id !== 'custom');
    setColumns([...getBaseColumns(), ...(gameColumns || [])]);
  }, [preferences, calculator]);

  // add records, with: sport, multiplier, ...<games at x deaths>
  useEffect(() => {
    const records = preferences.ui.displayedSports?.reduce<TableDataRow[]>(
      (prev, currentSport) => [
        ...prev,
        {
          id: currentSport,
          sport: currentSport,
          multiplier: calculator.get_sport_base(currentSport),
          ...calculateGameCells(currentSport),
        },
      ],
      []
    );
    setData([...(records || [])]);
  }, [preferences, calculator]);

  const onChange = (
    newData: TableDataRow[],
    rowId: string | number,
    columnId: string
  ) => {
    if (columnId !== 'multiplier') return;
    const newMMultiplier: Multiplier = {
      game: null,
      multiplier:
        (newData.filter((r) => r.id === rowId)[0]?.[columnId] as number) ?? 1,
      sport: rowId as string,
    };
    const newPreferences: UserPreferences = {
      ...preferences,
      multipliers: [
        ...preferences.multipliers.filter(
          (m) =>
            !(m.game == newMMultiplier.game && m.sport == newMMultiplier.sport)
        ),
        newMMultiplier,
      ],
    };
    setPreferences(newPreferences);
  };
  return (
    <Box>
      <Latex>{`$\\texttt{SportBase} \\cdot \\texttt{GameBase} \\cdot \\texttt{Multiplier} \\cdot \\texttt{Deaths} = \\texttt{ExerciseAmount}$`}</Latex>
      <Typography>
        This is the calculation, for how much exercises you have to do. In the
        following table you can modify every{' '}
        <Latex>{`$\\texttt{SportBase}$`}</Latex> to make an individual sport
        harder or easier.
      </Typography>
      <Typography>
        The table shows the sport, it's <Latex>{`$\\texttt{SportBase}$`}</Latex>
        , and for several games the amount of exercises with 10 Deaths and your
        current settings.
      </Typography>
      <EditableNumberTable
        onDataChange={onChange}
        columns={columns}
        data={data}
      ></EditableNumberTable>
    </Box>
  );
};
