import { useState, useEffect } from 'react';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';
import { useThemeStore } from '../useThemeStore';
import { SportDefinition, useSportStore } from '../useSportStore';
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

// Select the sport kind with a button
export const SportSelector = () => {
  const { currentTheme } = useThemeStore();
  const { currentSport, setSport } = useSportStore();
  const [apiData, setApiData] = useState<{ data: SportDefinition[] } | null>(
    null
  );

  // Fetch data from /api/default on localhost:8080
  useEffect(() => {
    fetch(`${BACKEND_BASE}/api/default`)
      .then((response) => response.json())
      .then((data: { data: SportDefinition[] }) => setApiData(data))
      .catch(console.error);
  }, []);
  if (apiData == null) {
    return <Typography>Waiting for Gin</Typography>;
  }

  // change sport, when game is changed
  if (currentTheme != currentSport?.game) {
    const matchingSport = apiData.data.find(
      (sport) => sport.game === currentTheme && sport.kind == currentSport?.kind
    );
    if (matchingSport) {
      setSport(matchingSport);
    }
  }
  console.log(apiData);
  return (
    <Box>
      {/* Vertical ButtonGroup for sports selection */}
      <ButtonGroup orientation="vertical" fullWidth>
        {apiData.data
          .filter((sport) => sport.game === currentTheme)
          .map((sport) => {
            return (
              <Button
                onClick={() => setSport(sport)}
                variant={
                  sport.kind === currentSport?.kind ? 'contained' : 'outlined'
                }
                key={sport.kind}
              >
                <img
                  src={sportIconMap[sport.kind]}
                  alt={sport.kind}
                  style={{ width: 50, height: 50 }}
                />
                <Typography>{sport.kind}</Typography>
              </Button>
            );
          })}
      </ButtonGroup>
    </Box>
  );
};
