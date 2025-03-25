import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { getThemeNames, useThemeStore } from '../zustand/useThemeStore';
import { useSportStore } from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';

import { DynamicGameGrid } from './DynamicGrid';
import { NUMBER_FONT } from '../statics';
import { GameSelectionMap } from './SportSelect';

export const GameSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const validGames = getThemeNames();

  return (
    <DynamicGameGrid
      items={validGames}
      capacity={{ xs: 5, sm: 8, md: 11, lg: 14, xl: 17 }}
      selectedItem={theme.custom.themeName}
      onSelect={async (item) => {
        await setTheme(item);
      }}
    ></DynamicGameGrid>
  );
};

export const PopNumber = ({
  value,
  font,
  stiffness,
  damping,
  mass,
}: {
  value: number;
  font: string;
  damping: number;
  stiffness: number;
  mass: number;
}) => {
  // Start with an initial spring value (can be 0 or value)
  const springValue = useSpring(0, {
    stiffness: stiffness,
    damping: damping,
    mass: mass,
  });

  const [displayed, setDisplayed] = useState(value);

  // Update the spring's target when "value" changes.
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // Subscribe to changes using useMotionValueEvent.
  useMotionValueEvent(springValue, 'change', (v) => {
    setDisplayed(Math.round(v));
  });

  const str = displayed.toString();
  const randomIndex =
    str.length > 0 ? Math.floor(Math.random() * str.length) : 0;

  return (
    <Typography
      style={{ fontFamily: `'${font}', cursive`, display: 'inline-block' }}
    >
      {str.split('').map((char, index) => (
        <motion.span
          key={index}
          style={{
            fontSize: index === randomIndex ? '8rem' : '8rem',
          }}
        >
          {char}
        </motion.span>
      ))}
    </Typography>
  );
};

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
        flexDirection: 'row',
        alignItems: 'center',
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
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{ justifyContent: 'center', fontFamily: 'inherit' }}
        >
          {GameSelectionMap.get(currentSport.sport)}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ justifyContent: 'center', fontFamily: 'inherit' }}
        >
          to do now
        </Typography>
      </Box>
    </Box>
  );
};
