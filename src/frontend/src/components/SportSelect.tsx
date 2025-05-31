import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Box,
  Typography,
  ButtonGroup,
  alpha,
  useMediaQuery,
} from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';
import { useSportStore } from '../useSportStore';
import { BACKEND_BASE } from '../statics';
import { GetSportsResponse } from '../models/Sport';

import {
  DeathDecorator,
  DefaultSportsCalculator,
  ExactlyOneDecorator,
  HumanLockDecorator,
  MultiplierDecorator,
  OverrideSportDecorator,
  SportsCalculator,
} from '../utils/SportCalculator';

import useCalculatorStore from '../zustand/CalculatorStore';
import { useSportResponseStore } from '../zustand/sportResponseStore';
import usePreferenceStore from '../zustand/PreferenceStore';
import { useUsedMultiplierStore } from '../zustand/usedMultiplierStore';
import { Multiplier } from '../models/Preferences';
import { animated, useSpring, useTransition } from 'react-spring';
import useErrorStore from '../zustand/Error';

const AnimatedButton = animated(Button);

// Select the sport kind with a button
export const SportSelector = () => {
  const { theme } = useThemeStore();
  const { currentSport, setSport } = useSportStore();
  const { sportResponse } = useSportResponseStore();
  const { setCalculator } = useCalculatorStore();
  const { preferences, preferencesLoaded } = usePreferenceStore();
  const { usedMultiplier } = useUsedMultiplierStore();
  const { setErrorMessage } = useErrorStore();

  function isInPreferences(value: string): Boolean {
    if (preferences.ui.displayedSports === null) return true;
    return preferences.ui.displayedSports.includes(value);
  }

  const displayedSports = useMemo((): Multiplier[] => {
    if (sportResponse?.sports === undefined) {
      return [];
    }
    const sports = sportResponse!.sports!;
    const sportPerferences = (
      preferences.ui.displayedSports ?? Object.keys(sports)
    ).map((sport) => {
      const multiplier: Multiplier = {
        game: null,
        multiplier: sports[sport] ?? 1,
        sport: sport,
      };
      return multiplier;
    });

    if (
      currentSport.sport !== null &&
      sportPerferences.filter((s) => s.sport === currentSport.sport).length <= 0
    ) {
      const multiplier: Multiplier = {
        game: null,
        multiplier: currentSport?.sport_multiplier ?? 1,
        sport: currentSport?.sport,
      };
      return [multiplier, ...sportPerferences];
    }
    return sportPerferences;
  }, [preferences, sportResponse, currentSport]);

  // transition for button elements in button group
  const transitions = useTransition(preferencesLoaded ? displayedSports : [], {
    from: { opacity: 0, transform: 'scale(0.7) translateY(-20px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: {
      opacity: 0,
      transform: 'scale(0.7) translateY(20px)',
      position: 'absolute',
    },
    keys: (item) => item.sport ?? 'none', // Use a unique key for each item
    config: { tension: 220, friction: 12 },
    trail: 120, // Optional: add a small delay between each item's animation
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * builds up the Decorator Stack, which is used to calculate the amount of exercies
   * and display it's latex.
   *
   * The Decorator Stack contains:
   *  - `DefaultCalculator` for backend defaults
   *  - `OverrideSportDecorator` for custom Sport overrides
   *  - `DeathDecorator` to include deaths in LaTeX calculation
   *  - `MultiplierDecorator` to include Multiplier Settings
   *  - `HumanLockDecorator` for custom Plank formula
   *  - `ExactlyOneDecorator` (only when game is custom) to set all previous values to 1
   */
  const buildDecoratorStack = () => {
    const BASE_SETTINGS = sportResponse ?? { sports: {}, games: {} };

    // base for calculating default values
    var base: SportsCalculator = new DefaultSportsCalculator(BASE_SETTINGS);

    // custom per game per sport overrides
    base = new OverrideSportDecorator(base, preferences.game_overrides);

    // add DeathDecorator, to wrap the output with the death amount
    base = new DeathDecorator(base);

    // custom multipliers, either global or per game and sport
    base = new MultiplierDecorator(base, preferences.multipliers);

    // custom decorator for planks
    base = new HumanLockDecorator(base);

    // check if game: custom is selected
    if (theme.custom.themeName == 'custom') {
      // add ExactlyOneDecorator, to always return 1
      base = new ExactlyOneDecorator(base);
    }

    setCalculator(base);
  };

  /**
   * updates the DecoratorStack, when:
   *  - game changs
   *  - selected sport changes
   *  - sport response from backend changes
   *  - preferences changes
   *  - usedMultiplier changes
   */
  useEffect(() => {
    buildDecoratorStack();
  }, [theme, currentSport, sportResponse, preferences, usedMultiplier]);

  // when game changes: change game multiplier and maybe change currentSport
  useEffect(() => {
    if (sportResponse?.games && theme.custom.themeName != currentSport?.game) {
      const gameMultiplierValue = sportResponse.games[theme.custom.themeName];

      if (gameMultiplierValue != null) {
        setSport({
          ...currentSport,
          game: theme.custom.themeName,
          game_multiplier: gameMultiplierValue,
        });
      }
    }
    console.log(sportResponse);
  }, [sportResponse, theme.custom.themeName, currentSport, setSport]);

  if (
    sportResponse === null ||
    !preferencesLoaded ||
    theme.custom.themeName === 'default'
  ) {
    // the displayed sports depend on preferences, so we wait until they are loaded
    return <Box />;
  }

  if (isMobile) {
    // return only a grid with 5 per row, with only icons
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 2,
          padding: 2,
        }}
      >
        {displayedSports.map(({ sport, multiplier }) => {
          const isSelected = sport === currentSport?.sport;

          return (
            <Button
              onClick={() => {
                currentSport.sport = sport;
                currentSport.sport_multiplier = multiplier;
                setSport(currentSport);
              }}
              variant={sport === currentSport?.sport ? 'contained' : 'outlined'}
              key={sport}
              sx={{
                backgroundColor: isSelected
                  ? null
                  : alpha(theme.palette.muted.dark, 0.2),
                textShadow: isSelected
                  ? null
                  : `2px 2px 2px ${theme.palette.muted.dark}`,
              }}
            >
              <img
                src={sportIconMap[String(sport)]}
                alt={String(sport)}
                style={{
                  width: 50,
                  height: 50,
                  filter: isSelected
                    ? 'brightness(0) invert(1)'
                    : theme.palette.mode === 'dark'
                    ? 'brightness(0) invert(0.8)'
                    : 'none',
                }}
              />
            </Button>
          );
        })}
      </Box>
    );
  }
  return (
    <Box width="clamp(40px, 100%, 350px)">
      {/* Vertical ButtonGroup for sports selection */}
      <ButtonGroup orientation="vertical" fullWidth>
        {transitions((style, { sport, multiplier }) => {
          const isSelected = sport === currentSport?.sport;

          return (
            <AnimatedButton
              style={style}
              onClick={() => {
                currentSport.sport = sport;
                currentSport.sport_multiplier = multiplier;
                setSport(currentSport);
              }}
              variant={sport === currentSport?.sport ? 'contained' : 'outlined'}
              key={sport}
              sx={{
                gap: 3,
                backgroundColor: isSelected
                  ? null
                  : alpha(theme.palette.muted.dark, 0.2),
                textShadow: isSelected
                  ? null
                  : `2px 2px 2px ${theme.palette.muted.dark}`,
              }}
            >
              <img
                src={sportIconMap[String(sport)]}
                alt={String(sport)}
                style={{
                  width: 50,
                  height: 50,
                  filter: isSelected
                    ? 'brightness(0) invert(1)'
                    : theme.palette.mode === 'dark'
                    ? 'brightness(0) invert(0.8)'
                    : 'none',
                  marginRight: 1,
                }}
              />
              <Typography>{String(sport).replace('_', ' ')}</Typography>
            </AnimatedButton>
          );
        })}
      </ButtonGroup>
    </Box>
  );
};

export { sportIconMap, GameSelectionMap };
