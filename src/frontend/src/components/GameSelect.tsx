import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { SportDefinition, useSportStore } from '../useSportStore';
import { useDeathAmountState } from './NumberSlider';
import { BACKEND_BASE } from '../statics';

const map = new Map();
map.set('pushup', 'Push-Ups');
map.set('plank', 'Seconds Plank');

import pushupSVG from '../assets/sports-pushup.svg';
import plankSVG from '../assets/sports-plank.svg';

const sportIconMap: Record<string, string> = {
  pushup: pushupSVG,
  plank: plankSVG,
};

export const GameSelector = () => {
  const { currentTheme, setTheme } = useThemeStore();
  const validGames = ['league', 'overwatch'];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
      }}
    >
      {validGames.map((themeKey) => {
        return (
          <Button
            key={themeKey}
            variant={currentTheme === themeKey ? 'contained' : 'outlined'}
            onClick={() => setTheme(themeKey)}
            sx={{
              fontSize: 42,
              border: '2px solid',
              borderColor: 'secondary.main',
              color: 'text.primary', // Added text color
              fontWeight: 'bold', // set text to bold
              '&:hover': {
                // Darken secondary color by 20%
                backgroundColor: (theme) =>
                  darken(theme.palette.primary.main, 0.2),
                borderColor: (theme) =>
                  darken(theme.palette.secondary.main, 0.2),
              },
              padding: 2,
            }}
          >
            {themeKey}
          </Button>
        );
      })}
    </Box>
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
          {map.get(currentSport.kind)}
        </Typography>
        <Typography variant="subtitle1" sx={{ justifyContent: 'center' }}>
          to do now
        </Typography>
      </Box>
    </Box>
  );
};
