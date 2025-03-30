import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { getThemeNames, useThemeStore } from '../zustand/useThemeStore';

import { DynamicGameGrid } from './DynamicGrid';

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
            fontSize: index === randomIndex ? '12vh' : '12vh',
          }}
        >
          {char}
        </motion.span>
      ))}
    </Typography>
  );
};
