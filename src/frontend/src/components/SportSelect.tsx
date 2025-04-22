import { useState, useEffect } from 'react';
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

import pushupSVG from '../assets/sports-pushup.svg';
import plankSVG from '../assets/sports-plank.svg';
import pilatesSVG from '../assets/sports-pilates.svg';
import squatsSVG from '../assets/sports-squats.svg';
import situpsSVG from '../assets/sports-situps.svg';
import russian_twistSVG from '../assets/sports-russian_twist.svg';
import dipSVG from '../assets/sports-dip.svg';
import useCalculatorStore from '../zustand/CalculatorStore';
import { useSportResponseStore } from '../zustand/sportResponseStore';
import usePreferenceStore from '../zustand/PreferenceStore';

const sportIconMap: Record<string, string> = {
  pushup: pushupSVG,
  plank: plankSVG,
  pilates: pilatesSVG,
  squats: squatsSVG,
  situps: situpsSVG,
  russian_twist: russian_twistSVG,
  dip: dipSVG,
};

// map for which is shown next to the score
const GameSelectionMap: Map<String, String> = new Map();
GameSelectionMap.set('pushup', 'Push-Ups');
GameSelectionMap.set('plank', 'Seconds Plank');
GameSelectionMap.set('pilates', 'Exercises');
GameSelectionMap.set('situps', 'Sit-Ups');
GameSelectionMap.set('squats', 'Squats');
GameSelectionMap.set('russian_twist', 'Russian Twists');
GameSelectionMap.set('dip', 'Dips');

// Select the sport kind with a button
export const SportSelector = () => {
  const { theme } = useThemeStore();
  const { currentSport, setSport } = useSportStore();
  const { sportResponse, setSportResponse } = useSportResponseStore();
  const { setCalculator } = useCalculatorStore();
  const { preferences } = usePreferenceStore();

  function isInPreferences(value: string): Boolean {
    if (preferences.ui.displayedSports === null) return true;
    return preferences.ui.displayedSports.includes(value);
  }

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  useEffect(() => {
    buildDecoratorStack();
  }, [theme, currentSport, sportResponse, preferences]);

  // Fetch data from /api/default on localhost:8080
  useEffect(() => {
    fetch(`${BACKEND_BASE}/api/default`)
      .then((response) => response.json())
      .then((data: GetSportsResponse) => {
        console.log(`response /api/sports/default: `, data);
        setSportResponse(data);
      })
      .catch(console.error);
    buildDecoratorStack();
  }, []);
  if (sportResponse === null) {
    return <Typography>Waiting for Gin</Typography>;
  }

  // when game changes: change game multiplier and maybe change currentSport
  if (sportResponse.games && theme.custom.themeName != currentSport?.game) {
    const matchingGame = sportResponse.games[theme.custom.themeName];

    if (matchingGame != null) {
      currentSport.game = theme.custom.themeName;
      currentSport.game_multiplier =
        sportResponse.games?.[theme.custom.themeName] ?? null;
      setSport(currentSport);
    }
  }
  console.log(sportResponse);

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
        {Object.entries(sportResponse.sports).map(([sport, multiplier]) => {
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
                src={sportIconMap[sport]}
                alt={sport}
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
        {Object.entries(sportResponse.sports)
          .filter((v) => isInPreferences(v[0]))
          .map(([sport, multiplier]) => {
            const isSelected = sport === currentSport?.sport;

            return (
              <Button
                onClick={() => {
                  currentSport.sport = sport;
                  currentSport.sport_multiplier = multiplier;
                  setSport(currentSport);
                }}
                variant={
                  sport === currentSport?.sport ? 'contained' : 'outlined'
                }
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
                  src={sportIconMap[sport]}
                  alt={sport}
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
                <Typography>{sport.replace('_', ' ')}</Typography>
              </Button>
            );
          })}
      </ButtonGroup>
    </Box>
  );
};

export { sportIconMap, GameSelectionMap };
