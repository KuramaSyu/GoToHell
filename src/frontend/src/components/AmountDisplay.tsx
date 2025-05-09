import { Box, lighten, Typography, useMediaQuery } from '@mui/material';
import { useSportStore } from '../useSportStore';
import { useDeathAmountStore } from './NumberSlider';
import { NUMBER_FONT } from '../statics';
import { PopNumber } from './GameSelect';
import { ReactElement, useMemo, useState } from 'react';
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
import { GameSelectionMap } from './SportSelect';

export const BIG_NUMBER_SIZE_MOBILE = '6vh';
export const BIG_NUMBER_SIZE_DESKTOP = '12vh';
export const AMOUNT_DISPLAY_TITLE_SX = { fontSize: '3vh' };
export const AMOUNT_DISPLAY_CONENT_SX = { fontSize: '2vh' };
export const AMOUNT_DISPLAY_CONTENT_BOX_SX = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  alignItems: 'left',
  mt: { xs: -2, md: -4 }, // Remove weird padding from font
};

export interface SportServiceProps {
  computedValue: number;
  isMobile: boolean;
}
export interface ISportService {
  toExercisesString: () => string;
  toReact: () => React.FC<SportServiceProps>;
}

class BaseSportService implements ISportService {
  sport: string;
  constructor(sport: string) {
    this.sport = sport;
  }
  toExercisesString(): string {
    return 'Exercises';
  }
  toReact(): React.FC<SportServiceProps> {
    return ({ computedValue, isMobile }) => (
      <PopNumber
        value={computedValue}
        font={NUMBER_FONT}
        fontsize={isMobile ? BIG_NUMBER_SIZE_MOBILE : BIG_NUMBER_SIZE_DESKTOP}
        stiffness={1000}
        damping={300}
        mass={1}
      />
    );
  }
}

class EmptySportService implements ISportService {
  constructor() {
    this.sport = '';
  }
  sport: string;

  toExercisesString(): string {
    return 'Exercises';
  }
  toReact(): React.FC<SportServiceProps> {
    return ({ computedValue, isMobile }) => null;
  }
}

class PlankService extends BaseSportService {
  constructor() {
    super('plank');
  }

  toExercisesString(): string {
    return 'Seconds Plank';
  }
  toReact(): React.FC<SportServiceProps> {
    return ({ computedValue, isMobile }) => (
      <Box>
        <PopNumber
          value={computedValue}
          font={NUMBER_FONT}
          fontsize={isMobile ? BIG_NUMBER_SIZE_MOBILE : BIG_NUMBER_SIZE_DESKTOP}
          stiffness={1000}
          damping={300}
          mass={1}
        />
        s
      </Box>
    );
  }
}

class SimpleFactory {
  static createSportService(sport: string | null): ISportService {
    if (sport == null) {
      return new EmptySportService();
    }

    switch (sport) {
      case 'plank':
        return new PlankService();
      default:
        return new BaseSportService(sport);
    }
  }
}

export const AmountDisplay = () => {
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountStore();
  const { calculator } = useCalculatorStore();
  const { theme } = useThemeStore();
  const { preferences } = usePreferenceStore();

  const isXL = useMediaQuery(theme.breakpoints.up('xl'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sportService = useMemo(() => {
    return SimpleFactory.createSportService(currentSport.sport);
  }, [currentSport.sport]);

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
            fontsize={
              isMobile ? BIG_NUMBER_SIZE_MOBILE : BIG_NUMBER_SIZE_DESKTOP
            }
            stiffness={1000}
            damping={300}
            mass={1}
          />
        </Box>
        <Box sx={AMOUNT_DISPLAY_CONTENT_BOX_SX}>
          <Typography sx={AMOUNT_DISPLAY_TITLE_SX} fontFamily={'inherit'}>
            {GameSelectionMap.get(currentSport.sport)}
          </Typography>
          <Typography sx={AMOUNT_DISPLAY_CONENT_SX} fontFamily={'inherit'}>
            to do now
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
