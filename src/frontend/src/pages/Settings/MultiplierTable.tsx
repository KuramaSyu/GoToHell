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
  const { sportResponse, setSportResponse } = useSportResponseStore();
  const [data, setData] = useState<TableDataRow[]>([{ id: 0, key: 'test' }]);
  const { calculator } = useCalculatorStore();
  const [columns, setColumns] = useState<EditableTableColumn[]>(
    getBaseColumns()
  );

  /**
   *
   * @param sport the id (string) of the sport
   * @returns the base multiplier of the sport
   */
  const getSportMultiplier = (sport: string): number => {
    if (sportResponse === undefined) return 1;
    return sportResponse?.sports[sport] ?? 1;
  };

  /**
   *
   */
  const calculateGameCells = (sport: string): Record<string, number> => {
    const multiplier = getSportMultiplier(sport);
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
  }, [preferences]);

  // add records, with: sport, multiplier, ...<games at x deaths>
  useEffect(() => {
    const records = preferences.ui.displayedSports?.reduce<TableDataRow[]>(
      (prev, current) => [
        ...prev,
        {
          id: current,
          sport: current,
          multiplier: getSportMultiplier(current),
          ...calculateGameCells(current),
        },
      ],
      []
    );
    setData([...(records || [])]);
  }, [preferences]);

  const onChange = (newData: TableDataRow[]) => {};
  return (
    <Box>
      <Latex>{`$\\texttt{SportBase} \\cdot \\texttt{GameBase} \\cdot \\texttt{Deaths} = \\texttt{ExerciseAmount}$`}</Latex>
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
