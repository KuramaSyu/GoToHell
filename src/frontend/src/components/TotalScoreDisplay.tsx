import { useEffect } from 'react';

import { useUserStore } from '../userStore';
import { SportScore } from '../models/Sport';

import { useTotalScoreStore } from '../zustand/TotalScoreStore';
import { PopNumber } from './GameSelect';
import { useSportStore } from '../useSportStore';
import { Box, Typography } from '@mui/material';
import { NUMBER_FONT } from '../statics';
import { GameSelectionMap } from './SportSelect';

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
  const bigNumber = GetScore(currentSport!.sport!, amounts);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'column',
          lg: 'row',
        },
        justifyItems: 'center',
        alignItems: {
          xs: 'left',
          md: 'left',
          lg: 'center',
        },
        fontFamily: NUMBER_FONT,
      }}
    >
      <Box
        sx={{
          mr: 2,
          //width: `calc(12vh * 0.6 * ${bigNumber.toString().length})`,
        }}
      >
        <PopNumber
          value={bigNumber}
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
          alignItems: 'left',
          mt: { xs: -4, md: -4 }, // Remove weird padding from font
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
