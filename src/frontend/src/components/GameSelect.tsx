import { motion } from "framer-motion";
import React from 'react';
import { ThemeProvider, CssBaseline, Button, Container, Box } from '@mui/material';
import { darkTheme, nordTheme, themes } from '../themes';
import { useThemeStore } from '../useThemeStore';
import { darken } from '@mui/material/styles';

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
                '&:hover': {
                    // Darken secondary color by 20%
                    backgroundColor: (theme) => darken(theme.palette.primary.main, 0.2),
                    borderColor: (theme) => darken(theme.palette.secondary.main, 0.2),
                },
                padding: 5
            }}
            >
            {themeKey}
            </Button>
        ))}
        </Box>
    );
};

export default GameSelector;
