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

const getBaseColumns = (): EditableTableColumn[] => {
  return [
    {
      id: 'sport',
      label: 'Sport',
      isEditable: false,
    },
    {
      id: 'multiplier',
      label: 'Multiplier',
      isEditable: true,
    },
  ];
};
export const MultiplierTable: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const [data, setData] = useState<TableDataRow[]>([{ id: 0, key: 'test' }]);
  const [columns, setColumns] = useState<EditableTableColumn[]>(
    getBaseColumns()
  );

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

  // add sports to columns when preferences are loaded
  useEffect(() => {
    const records = preferences.ui.displayedSports?.reduce<TableDataRow[]>(
      (prev, current) => [...prev, { sport: current, id: current }],
      []
    );
    setData([...(records || [])]);
  }, [preferences]);

  const onChange = (newData: TableDataRow[]) => {};
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4">Sport Multipliers</Typography>
      <EditableNumberTable
        onDataChange={onChange}
        columns={columns}
        data={data}
      ></EditableNumberTable>
    </Box>
  );
};
