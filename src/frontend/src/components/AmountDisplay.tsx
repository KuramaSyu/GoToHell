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
import { Timedelta } from '../utils/Timedelta';

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

export function getAnimatedNumberSize(isMobile: boolean, numberKind: string) {
  if (numberKind === 'time') {
    return isMobile ? '3vh' : '6vh';
  }
  return isMobile ? BIG_NUMBER_SIZE_MOBILE : BIG_NUMBER_SIZE_DESKTOP;
}

export interface SportServiceProps {
  computedValue: number;
  isMobile: boolean;
}

const NumberDisplay: React.FC<SportServiceProps> = ({
  computedValue,
  isMobile,
}) => {
  return (
    <PopNumber
      value={computedValue}
      font={NUMBER_FONT}
      fontsize={isMobile ? BIG_NUMBER_SIZE_MOBILE : BIG_NUMBER_SIZE_DESKTOP}
      stiffness={1000}
      damping={300}
      mass={1}
      key={'AnimatedNumber'}
    />
  );
};

const TimeDisplay: React.FC<SportServiceProps> = ({
  computedValue,
  isMobile,
}) => {
  const timedelta = new Timedelta(computedValue);
  const seconds = timedelta.seconds();
  const minutes = timedelta.minutes();
  const hours = timedelta.hours();
  const numberKind = 'time';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {hours > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PopNumber
            value={hours}
            font={NUMBER_FONT}
            fontsize={getAnimatedNumberSize(isMobile, numberKind)}
            stiffness={1000}
            damping={300}
            mass={1}
          />
          <Typography
            fontFamily={NUMBER_FONT}
            fontSize={getAnimatedNumberSize(isMobile, numberKind)}
          >
            :
          </Typography>
        </Box>
      ) : null}
      {minutes > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PopNumber
            value={minutes}
            font={NUMBER_FONT}
            fontsize={getAnimatedNumberSize(isMobile, numberKind)}
            stiffness={1000}
            damping={300}
            mass={1}
            zeroPadding={2}
          />
          <Typography
            fontFamily={NUMBER_FONT}
            fontSize={getAnimatedNumberSize(isMobile, numberKind)}
          >
            :
          </Typography>
        </Box>
      ) : null}
      {seconds > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PopNumber
            value={seconds}
            font={NUMBER_FONT}
            fontsize={getAnimatedNumberSize(isMobile, numberKind)}
            stiffness={1000}
            damping={300}
            mass={1}
            zeroPadding={2}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export function getDisplayComponent(sport: string | undefined) {
  switch (sport) {
    case 'plank':
      return TimeDisplay;
    default:
      return NumberDisplay;
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

  if (currentSport.game == null || currentSport.sport == null) {
    return <Box></Box>;
  }

  const computedValue = calculator.calculate_amount(
    currentSport.sport!,
    currentSport.game!,
    amount
  );

  const DisplayComponent = getDisplayComponent(currentSport.sport);
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
          <DisplayComponent computedValue={computedValue} isMobile={isMobile} />
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
