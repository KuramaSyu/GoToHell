import {
  Box,
  lighten,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
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
import { getSportDescription } from '../../utils/DescriptionProvider';

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
  const { theme } = useThemeStore();
  return (
    <PopNumber
      value={computedValue}
      font={NUMBER_FONT}
      fontsize={isMobile ? BIG_NUMBER_SIZE_MOBILE : BIG_NUMBER_SIZE_DESKTOP}
      stiffness={1000}
      damping={300}
      mass={1}
      key={'AnimatedNumber'}
      style={{
        color: theme.palette.text.primary,
        textShadow: `5px 5px ${theme.palette.primary.dark}`,
      }}
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
  const { theme } = useThemeStore();
  const style = {
    color: theme.palette.text.primary,
    textShadow: `4px 4px ${theme.palette.primary.dark}`,
  };
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
            style={style}
          />
          <Typography
            fontFamily={NUMBER_FONT}
            fontSize={getAnimatedNumberSize(isMobile, numberKind)}
            style={style}
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
            style={style}
          />
          <Typography
            fontFamily={NUMBER_FONT}
            fontSize={getAnimatedNumberSize(isMobile, numberKind)}
            style={style}
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
          style={style}
        />
      </Box>
    </Box>
  );
};

export function getDisplayComponent(
  sport: string | undefined,
): React.FC<SportServiceProps> {
  switch (sport) {
    case 'plank':
    case 'workout':
      return TimeDisplay;
    default:
      return NumberDisplay;
  }
}

export const AmountDisplay = () => {
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountStore();
  const { calculator } = useCalculatorStore();
  const { isMobile, isXL } = useBreakpoint();

  if (currentSport.game == null || currentSport.sport == null) {
    return <Box></Box>;
  }

  const computedValue = calculator.calculate_amount(
    currentSport.sport!,
    currentSport.game!,
    amount,
  );

  const DisplayComponent = getDisplayComponent(currentSport.sport);
  return (
    <Tooltip
      title={calculator.make_box(
        currentSport.sport,
        currentSport.game,
        computedValue,
      )}
      slotProps={{
        tooltip: {
          sx: { backgroundColor: 'transparent' },
        },
        arrow: {
          sx: { color: 'transparent' },
        },
      }}
      arrow
      placement='left'
    >
      <Box>
        <DisplayComponent computedValue={computedValue} isMobile={isMobile} />
      </Box>
    </Tooltip>
  );
};
