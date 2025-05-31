import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { getThemeNames, useThemeStore } from '../zustand/useThemeStore';

import { DynamicGameGrid } from './DynamicGrid';
import usePreferenceStore from '../zustand/PreferenceStore';
import { CustomTheme } from '../theme/customTheme';

/**
 *
 * @param preferences the user preferences to filter themes
 * @param getThemeNames function, which returns a list of available themes
 * @param currentTheme the currently selected theme - will be pushed to index 0 if not present
 * @returns the list of shown themes in the UI
 */
function getValidGames(
  preferences: string[] | null,
  getThemeNames: () => string[],
  currentTheme: CustomTheme
): string[] {
  var themes = getThemeNames();
  if (preferences !== null && preferences.length > 0) {
    themes = preferences;
  }
  if (!themes.includes(currentTheme.custom.themeName)) {
    // push theme to index 0
    themes = [currentTheme.custom.themeName, ...themes];
  }
  return themes;
}

export const GameSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const { preferences, preferencesLoaded } = usePreferenceStore();
  const [validGames, setValidGames] = useState<string[]>([]);

  useEffect(() => {
    setValidGames(
      getValidGames(preferences.ui.displayedGames, getThemeNames, theme)
    );
  }, [preferences, theme]);

  if (!preferencesLoaded || theme.custom.themeName === 'default') {
    // the displayed games depend on preferences, so we wait until they are loaded
    // which is done in the theme store
    return null;
  }
  return (
    <DynamicGameGrid
      items={validGames}
      capacity={{ xs: 20, sm: 25, md: 11, lg: 14, xl: 17 }}
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
  fontsize,
  zeroPadding,
}: {
  value: number;
  font: string;
  damping: number;
  stiffness: number;
  mass: number;
  fontsize?: string;
  zeroPadding?: number;
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

  var str = displayed.toString();
  if (zeroPadding) {
    str = str.padStart(zeroPadding, '0');
  }
  const randomIndex =
    str.length > 0 ? Math.floor(Math.random() * str.length) : 0;

  return (
    <Typography
      component="span"
      style={{ fontFamily: `'${font}', cursive`, display: 'inline-block' }}
    >
      {str.split('').map((char, index) => (
        <motion.span
          key={index}
          style={{
            fontSize: fontsize ?? '12vh',
          }}
        >
          {char}
        </motion.span>
      ))}
    </Typography>
  );
};
