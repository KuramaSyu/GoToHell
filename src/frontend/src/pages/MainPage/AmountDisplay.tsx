import { Box, lighten, Typography, useMediaQuery } from '@mui/material';
import { useSportStore } from '../../useSportStore';
import { useDeathAmountStore } from './NumberSlider';
import { NUMBER_FONT } from '../../statics';
import React, { ReactElement, useMemo, useState } from 'react';
import {
  DefaultSportsCalculator,
  ExactlyOneDecorator,
  MultiplierDecorator,
  OverrideSportDecorator,
  SportsCalculator,
} from '../../utils/SportCalculator';
import useCalculatorStore from '../../zustand/CalculatorStore';
import Star from '../../components/Shapes';
import { useThemeStore } from '../../zustand/useThemeStore';
import { darken } from '@mui/material/styles';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { Timedelta, Unit, unitToString } from '../../utils/Timedelta';
import { GameSelectionMap } from '../../utils/data/Sports';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { PopNumber } from './PopNumber';
import { styled } from '@mui/material';
import { motion } from 'framer-motion';

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
    return isMobile ? '4vh' : '8vh';
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
      style={{}}
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
  const biggestUnit = timedelta.biggestUnit();
  const numberKind = 'time';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {biggestUnit >= Unit.hours ? (
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
      {biggestUnit >= Unit.minutes ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PopNumber
            value={minutes}
            font={NUMBER_FONT}
            fontsize={getAnimatedNumberSize(isMobile, numberKind)}
            stiffness={1000}
            damping={300}
            mass={1}
            zeroPadding={hours > 0 ? 2 : undefined}
          />
          <Typography
            fontFamily={NUMBER_FONT}
            fontSize={getAnimatedNumberSize(isMobile, numberKind)}
          >
            :
          </Typography>
        </Box>
      ) : null}

      {/* seconds are always shown */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <PopNumber
          value={seconds}
          font={NUMBER_FONT}
          fontsize={getAnimatedNumberSize(isMobile, numberKind)}
          stiffness={1000}
          damping={300}
          mass={1}
          zeroPadding={minutes > 0 ? 2 : undefined}
        />
      </Box>
    </Box>
  );
};

export function getDisplayComponent(
  sport: string | undefined
): React.FC<SportServiceProps> {
  switch (sport) {
    case 'plank':
      return TimeDisplay;
    default:
      return NumberDisplay;
  }
}

export function getSportDescription(
  sport: string | undefined,
  computedValue: number
): string | undefined {
  console.log('Getting sport description for', sport, computedValue);
  if (sport === 'plank') {
    const timedelta = new Timedelta(computedValue);
    const biggestUnit = timedelta.biggestUnit();
    return unitToString(biggestUnit);
  }
  if (sport === undefined) return;
  return GameSelectionMap.get(sport) as string;
}

export const AmountDisplay = () => {
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountStore();
  const { calculator } = useCalculatorStore();
  const { theme } = useThemeStore();
  const { preferences } = usePreferenceStore();
  const { isMobile, isXL } = useBreakpoint();

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
            {getSportDescription(currentSport.sport, computedValue) ?? 'test'}
          </Typography>
          <Typography sx={AMOUNT_DISPLAY_CONENT_SX} fontFamily={'inherit'}>
            to do now
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
