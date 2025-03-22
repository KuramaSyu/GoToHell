import { useEffect } from 'react';

import { useUserStore } from '../userStore';
import { SportScore } from '../models/Sport';

import { useTotalScoreStore } from '../zustand/TotalScoreStore';
import { PopNumber } from './GameSelect';
import { GameSelectionMap, useSportStore } from '../useSportStore';
import { Box, Typography } from '@mui/material';
import { NUMBER_FONT } from '../statics';

// returns the score of the kind
// game does not matter, since it's summed up
const GetScore = (kind: string, amounts: SportScore[]) => {
  const score = amounts.find((score) => score.kind === kind);
  return score?.amount || 0;
};

export const TotalScoreDisplay = () => {
  const { currentSport } = useSportStore();
  const { user } = useUserStore();
  const { amounts, setAmounts, refreshTrigger } = useTotalScoreStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        return;
      }
      const fut = await user.fetchTotalScore();
      if (fut.ok) {
        const parsed_data: { results?: SportScore[] } = await fut.json();
        if (parsed_data.results) {
          setAmounts(parsed_data.results);
        }
      } else {
        console.error('Failed to fetch total score');
      }
    };
    fetchData();
  }, [user, refreshTrigger]);

  if (!currentSport || !user) {
    return <Typography></Typography>;
  }
  // const for current sport score display
  const currentSportString = currentSport
    ? GameSelectionMap.get(currentSport.sport)
    : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyItems: 'center',
        alignItems: 'center',
        fontFamily: NUMBER_FONT,
      }}
    >
      <Box sx={{ mr: 2 }}>
        <PopNumber
          value={GetScore(currentSport!.sport!, amounts)}
          font={NUMBER_FONT}
          stiffness={500}
          damping={200}
          mass={1}
        ></PopNumber>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" fontFamily={'inherit'}>
          {currentSportString}
        </Typography>
        <Typography variant="subtitle1" fontFamily={'inherit'}>
          in total
        </Typography>
      </Box>
    </Box>
  );
};
