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

const AnimatedBox = animated(Box);
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
  const sports = Object.keys(sportResponse?.sports ?? {});

  const filteredSports = useMemo(() => {
    if (typed === null) {
      return [];
    }
    return sports.filter((s) => s.toLowerCase().includes(typed!.toLowerCase()));
  }, [typed]);

  // triggerd when clicked or enter pressed
  const onEnter = () => {
    // select first element
    const element = filteredSports[0];
    if (element === undefined) return;
    const sportMultiplier = sportResponse?.sports[element];
    if (sportMultiplier === undefined) return;
    setSport({
      ...currentSport,
      sport: element,
      sport_multiplier: sportMultiplier,
    });

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
  }, [filteredSports]);

  const springs = useSprings(
    filteredSports.length,
    filteredSports.map((_, index) => ({
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
            key={filteredSports[i]}
            style={style}
          >
            {i !== 0 ? (
              <Typography variant="h5" sx={{ fontWeight: '300' }}>
                {filteredSports[i]!.toUpperCase()}
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
                  {filteredSports[i]!.toUpperCase()}
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
