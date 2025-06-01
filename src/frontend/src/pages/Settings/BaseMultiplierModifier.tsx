import {
  Box,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { useEffect, useState } from 'react';

export const BaseMultiplierModifier: React.FC = () => {
  const { sportResponse, setSportResponse } = useSportResponseStore();
  const [selectedGames, setSelectedGames] = useState<[string, number][]>();
  const [deathAmount, setDeathAmount] = useState(10);

  useEffect(() => {
    if (sportResponse === undefined) return;
    const defaultGames = ['league'];
    setSelectedGames(
      Object.entries(sportResponse!.games).filter(([game, multiplier]) =>
        defaultGames.includes(game)
      )
    );
  }, [sportResponse]);
  if (sportResponse === null) return null;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', zIndex: 1, width: '80%' }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 300 }}>
          <TableHead>
            <TableCell>Sport</TableCell>
            <TableCell>Base Multiplier</TableCell>
          </TableHead>
          {Object.entries(sportResponse!.sports).map(([sport, multiplier]) => {
            return (
              <TableRow
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell component="th">{sport}</TableCell>
                <TableCell>{multiplier}</TableCell>
                {/* TODO add row for each game in selectedGames, and calculate it's amount (including multiplier) with <deathAmount> */}
              </TableRow>
            );
          })}
        </Table>
      </TableContainer>
    </Box>
  );
};
