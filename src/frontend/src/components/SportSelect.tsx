import { useState, useEffect } from 'react';
import { Button, Box, Typography, ButtonGroup, alpha } from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';
import { useSportStore } from '../useSportStore';
import { BACKEND_BASE } from '../statics';
import { GetSportsResponse } from '../models/Sport'

import pushupSVG from '../assets/sports-pushup.svg';
import plankSVG from '../assets/sports-plank.svg';
import pilatesSVG from '../assets/sports-pilates.svg';
import squatsSVG from '../assets/sports-squats.svg'

const sportIconMap: Record<string, string> = {
  pushup: pushupSVG,
  plank: plankSVG,
  pilates: pilatesSVG,
  squats: squatsSVG,
};



// Select the sport kind with a button
export const SportSelector = () => {
  const { theme } = useThemeStore();
  const { currentSport, setSport } = useSportStore();
  const [apiData, setApiData] = useState<GetSportsResponse | null>(null);

  // Fetch data from /api/default on localhost:8080
  useEffect(() => {
    fetch(`${BACKEND_BASE}/api/default`)
      .then((response) => response.json())
      .then((data: GetSportsResponse ) => {console.log(`response /api/sports/default: `, data);setApiData(data)})
      .catch(console.error);
  }, []);
  if (apiData === null) {
    return <Typography>Waiting for Gin</Typography>;
  }

  // when game changes: change game multiplier and maybe change currentSport
  if (apiData.games && theme.custom.themeName != currentSport?.game) {
    const matchingGame = apiData.games[theme.custom.themeName];

    if (matchingGame != null) {
      currentSport.game = theme.custom.themeName
      currentSport.game_multiplier = apiData.games?.[theme.custom.themeName] ?? null
      setSport(currentSport);
    }
  }
  console.log(apiData);

  return (
    <Box width="clamp(40px, 100%, 350px)">
      {/* Vertical ButtonGroup for sports selection */}
      <ButtonGroup orientation="vertical" fullWidth>
        {Object.entries(apiData.sports).map(([sport, multiplier]) => {
            const isSelected = sport === currentSport?.sport;

            return (
              <Button
                onClick={() => {
                  currentSport.sport = sport;
                  currentSport.sport_multiplier = multiplier;
                  setSport(currentSport)
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
                <Typography>{sport}</Typography>
              </Button>
            );
          })}
      </ButtonGroup>
    </Box>
  );
};
