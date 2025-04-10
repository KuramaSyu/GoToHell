import { Box, lighten, Typography, useMediaQuery } from '@mui/material';
import { useSportStore } from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';
import { NUMBER_FONT } from '../statics';
import { PopNumber } from './GameSelect';
import { GameSelectionMap } from './SportSelect';
import { useState } from 'react';
import {
  DefaultSportsCalculator,
  ExactlyOneDecorator,
  MultiplierDecorator,
  OverrideSportDecorator,
  SportsCalculator,
} from '../utils/SportCalculator';
import useCalculatorStore from '../zustand/CalculatorStore';
import Star from './Shapes';
import { useThemeStore } from '../zustand/useThemeStore';
import { darken } from '@mui/material/styles';
import usePreferenceStore from '../zustand/PreferenceStore';

export const AmountDisplay = () => {
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountState();
  const { calculator } = useCalculatorStore();
  const { theme } = useThemeStore();
  const { preferences } = usePreferenceStore();

  const isXL = useMediaQuery(theme.breakpoints.up('xl'));

  if (currentSport.game == null || currentSport.sport == null) {
    return <Box></Box>;
  }

  const computedValue = calculator.calculate_amount(
    currentSport.sport!,
    currentSport.game!,
    amount
  );
  // currentSport.game_multiplier! * amount * currentSport.sport_multiplier!;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyItems: 'center',
        alignItems: {
          xs: 'right',
          md: 'right',
          lg: 'center',
        },
      }}
    >
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
        {isXL
          ? calculator.make_box(currentSport.sport!, currentSport.game!, amount)
          : null}

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
            alignItems: 'right',
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
    </Box>
  );
};
