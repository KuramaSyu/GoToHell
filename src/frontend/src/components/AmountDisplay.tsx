import { Box, Typography } from '@mui/material';
import { useSportStore } from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';
import { NUMBER_FONT } from '../statics';
import { PopNumber } from './GameSelect';
import { GameSelectionMap } from './SportSelect';

export const AmountDisplay = () => {
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountState();

  if (
    currentSport.game_multiplier == null ||
    currentSport.sport_multiplier == null
  ) {
    return <Box></Box>;
  }

  const computedValue =
    currentSport.game_multiplier! * amount * currentSport.sport_multiplier!;

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
          xs: 'right',
          md: 'right',
          lg: 'center',
        },
        fontFamily: NUMBER_FONT,
      }}
    >
      <Box sx={{ mr: 2 }}>
        <PopNumber
          value={computedValue}
          font={NUMBER_FONT}
          stiffness={1000}
          damping={300}
          mass={1}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'right',

          mt: { xs: -4, md: -4 }, // Remove weird padding from font
        }}
      >
        <Typography variant="h5" fontFamily={'inherit'}>
          {GameSelectionMap.get(currentSport.sport)}
        </Typography>
        <Typography variant="subtitle1" fontFamily={'inherit'}>
          to do now
        </Typography>
      </Box>
    </Box>
  );
};
