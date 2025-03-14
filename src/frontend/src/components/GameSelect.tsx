import { delay, motion, useMotionValueEvent, useSpring } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box, Typography } from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';
import { SportDefinition, useSportStore } from '../useSportStore';
import { useDeathAmountState } from "./SportSelect";
import { BACKEND_BASE } from "../statics";


const map = new Map();
map.set("pushup", "Push-Ups")
map.set("plank", "Seconds Plank")

// Select the sport kind with a button
export const GameStatsSelector = () => {
    const {currentTheme, setTheme} = useThemeStore();
    const { currentSport, setSport } = useSportStore();
    const [apiData, setApiData] = useState<{ data: SportDefinition[] } | null>(null);

    // Fetch data from /api/default on localhost:8080
    useEffect(() => {
        fetch(`${BACKEND_BASE}/api/default`)
            .then(response => response.json())
            .then((data: { data: SportDefinition[] }) => setApiData(data))
            .catch(console.error);
    }, []);
    if (apiData == null) {
        return (<Typography>Waiting for Gin</Typography>);
    }

    // change sport, when game is changed
    if (currentTheme != currentSport?.game) {
      const matchingSport = apiData.data.find(sport => sport.game === currentTheme && sport.kind == currentSport?.kind);
      if (matchingSport) {
        setSport(matchingSport)

      }
    }
    console.log(apiData);
    return (
        <Box>
            {/* Print API data as a JSON string */}
                {apiData.data.filter((sport) => (sport.game == currentTheme)).map((sport) => (
                    <Button
                    onClick={() => setSport(sport)}
                    variant={sport.kind == currentSport?.kind ? 'contained' : 'outlined'}
                    key={sport.kind}
                    >
                    <Typography>{sport.kind}</Typography>
                    </Button>
                ))}
        </Box>
    );
}

const GameSelector = () => {
    const {currentTheme, setTheme} = useThemeStore();
    const validGames = ["league", "overwatch"];
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
        {validGames.map((themeKey) => (
            <Button
            key={themeKey}
            variant={currentTheme === themeKey ? 'contained' : 'outlined'}
            onClick={() => setTheme(themeKey)}
            sx={{
                fontSize: 42,
                border: "2px solid",
                borderColor: "secondary.main",
                color: "text.primary", // Added text color
                fontWeight: "bold",  // set text to bold
                '&:hover': {
                    // Darken secondary color by 20%
                    backgroundColor: (theme) => darken(theme.palette.primary.main, 0.2),
                    borderColor: (theme) => darken(theme.palette.secondary.main, 0.2),
                },
                padding: 2
            }}
            >
            {themeKey}
            </Button>
        ))}
        </Box>
    );
};

export default GameSelector;

export const PopNumber = ({ value, font }: { value: number; font: string }) => {
    // Start with an initial spring value (can be 0 or value)
    const springValue = useSpring(0, { stiffness: 1000, damping: 300, mass: 1, duration: 500});
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
    const randomIndex = str.length > 0 ? Math.floor(Math.random() * str.length) : 0;
  
    return (
      <Typography style={{ fontFamily: font, display: 'inline-block' }}>
        {str.split('').map((char, index) => (
          <motion.span
            key={index}
            style={{ fontSize: index === randomIndex ? '8rem' : '8rem' }}
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
    const { currentTheme } = useThemeStore();
  
    if (currentSport == null) {
      return <Box></Box>;
    }
  
    const computedValue = currentSport.death_multiplier * amount;
  
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Animate the computed value with PopNumber */}
        <PopNumber value={computedValue} font="Cursive, sans-serif" />
        <Typography variant="h3">{map.get(currentSport.kind)}</Typography>
      </Box>
    );
  };

