import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';
import { getThemeNames, useThemeStore } from '../zustand/useThemeStore';
import { darken } from '@mui/material/styles';
import {
  GameSelectionMap,
  SportDefinition,
  useSportStore,
} from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';

import { DynamicGameGrid } from './DynamicGrid';

export const GameSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const validGames = getThemeNames();
  const numGames = validGames.length;

  // Dynamically choose number of columns based on the total number of games.
  // This gives a nearly square grid.
  const COLS = Math.ceil(Math.sqrt(numGames));

  // Helper: if the game name is long, let it span more columns.
  // For example, a game like "Overwatch" (longer name) gets more space.
  const getGridColumnSpan = (gameKey: string) => {
    // Adjust span: if name length > 5, span 2 columns (but never exceed total COLS)
    return Math.min(COLS, gameKey.length > 5 ? 2 : 1);
  };

  return (
    <DynamicGameGrid
      items={validGames}
      capacity={{ xs: 6, sm: 8, md: 15 }}
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
    <Typography style={{ fontFamily: font, display: 'inline-block' }}>
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

  if (currentSport == null) {
    return <Box></Box>;
  }

  const computedValue = currentSport.death_multiplier * amount;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyItems: 'center',
      }}
    >
      <Box sx={{ mr: 2 }}>
        <PopNumber
          value={computedValue}
          font="Cursive, sans-serif"
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
        <Typography variant="h6" sx={{ justifyContent: 'center' }}>
          {GameSelectionMap.get(currentSport.kind)}
        </Typography>
        <Typography variant="subtitle1" sx={{ justifyContent: 'center' }}>
          to do now
        </Typography>
      </Box>
    </Box>
  );
};
