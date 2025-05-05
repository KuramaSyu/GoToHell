import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { animated, useSprings, useTransition } from 'react-spring';
import { useSportStore } from '../../useSportStore';
import {
  KeyboardReturn,
  KeyboardReturnOutlined,
  KeyboardReturnTwoTone,
} from '@mui/icons-material';
import { getThemeNames, useThemeStore } from '../../zustand/useThemeStore';

/**
 * Represents an Abstract Element, which can be selected
 */
interface SearchEntry {
  name: string;
  /**
   * This "selects" the current Search Entry in sense of, that is is now the used Game/Sport
   */
  select(): void;
}

/**
 * Represents any of the available Sport Kinds
 */
class SportEntry implements SearchEntry {
  name: string;
  constructor(sport: string) {
    this.name = sport;
  }

  select(): void {
    const sportResponse = useSportResponseStore.getState().sportResponse;
    const { setSport, currentSport } = useSportStore.getState();
    const sportMultiplier = sportResponse?.sports[this.name];
    if (sportMultiplier === undefined) return;
    setSport({
      ...currentSport,
      sport: this.name,
      sport_multiplier: sportMultiplier,
    });
  }
}

/**
 * Represents any of the available games
 */
class GameEntry implements SearchEntry {
  name: string;
  constructor(game: string) {
    this.name = game;
  }

  select(): void {
    const { setTheme } = useThemeStore.getState();
    setTheme(this.name);
  }
}

export const AnimatedBox = animated(Box);
export interface SearchModalProps {
  typed: string | null;
  setTyped: React.Dispatch<React.SetStateAction<string | null>>;
}
export const SearchModal: React.FC<SearchModalProps> = ({
  typed,
  setTyped,
}) => {
  const { sportResponse } = useSportResponseStore();
  const { currentSport, setSport } = useSportStore();
  getThemeNames();
  const sports = Object.keys(sportResponse?.sports ?? {});

  const filteredSearch: SearchEntry[] = useMemo(() => {
    if (typed === null) {
      return [];
    }
    // filter sports and wrap into SearchEntry
    const sportSearch = sports
      .filter((s) => s.toLowerCase().includes(typed!.toLowerCase()))
      .map((e) => new SportEntry(e));

    // filter games and wrap into SearchEntry
    const gameSearch = getThemeNames()
      .filter((s) => s.toLowerCase().includes(typed!.toLowerCase()))
      .map((e) => new GameEntry(e));
    return [...sportSearch, ...gameSearch];
  }, [typed]);

  // triggerd when clicked or enter pressed
  const onEnter = () => {
    // select first element
    const element = filteredSearch[0];
    if (element === undefined) return;
    element.select();
    setTyped(null);
  };

  // opening keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredSearch]);

  const springs = useSprings(
    filteredSearch.length,
    filteredSearch.map((_, index) => ({
      from: { opacity: 0, transform: 'scale(0.7)' },
      to: { opacity: 1, transform: 'scale(1)' },

      config: { tension: 200, friction: 20 },
    }))
  );

  // box with enter icon and Select as text, rounded, with blur
  const selectBox = (
    <Button
      onClick={onEnter}
      variant="outlined"
      sx={{
        display: 'inline-flex', // Use inline-flex to size based on content
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        padding: '8px 16px',
        borderRadius: 6,
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <KeyboardReturnTwoTone sx={{ fontSize: '1.2rem' }} />
      <Typography variant="body2" fontWeight={600}>
        Select
      </Typography>
    </Button>
  );
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <TextField
        variant="outlined"
        placeholder="Search..."
        value={typed}
        onChange={() => {}}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          maxWidth: 600,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '33vw',
          height: '33vh',
          top: '15vh',
          gap: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {springs.map((style, i) => (
          <AnimatedBox
            sx={{
              width: '100%',
              height: '40px',
              display: 'flex',
              backdropFilter: 'blur(30px)',
              borderRadius: 6,
              backgroundColor:
                i === 0
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            key={filteredSearch[i]?.name}
            style={style}
          >
            {i !== 0 ? (
              <Typography variant="h5" sx={{ fontWeight: '300' }}>
                {filteredSearch[i]!.name.toUpperCase()}
              </Typography>
            ) : (
              // flex with one empty element, the typography and selectbox
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Box width={1 / 3}></Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: '300', width: 1 / 3, textAlign: 'center' }}
                >
                  {filteredSearch[i]!.name.toUpperCase()}
                </Typography>
                <Box
                  width={1 / 3}
                  sx={{ display: 'flex', justifyContent: 'right' }}
                >
                  {selectBox}
                </Box>
              </Box>
            )}
          </AnimatedBox>
        ))}
      </Box>
    </Box>
  );
};
