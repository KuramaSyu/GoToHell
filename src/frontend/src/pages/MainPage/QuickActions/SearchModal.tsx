import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useSportResponseStore } from '../../../zustand/sportResponseStore';
import { animated, useSprings } from 'react-spring';
import { useSportStore } from '../../../useSportStore';
import { KeyboardReturnTwoTone } from '@mui/icons-material';
import {
  customThemes,
  getThemeNames,
  useThemeStore,
} from '../../../zustand/useThemeStore';
import { SearchCardButton } from './QuickActionEntries';
import Fuse from 'fuse.js';
import { GameEntry, SearchEntry, SportEntry } from './SearchEntry';

const gameFuse = new Fuse(customThemes, {
  keys: ['name', 'longName'],
  threshold: 0.5,
});

export const AnimatedBox = animated(Box);
export interface SearchModalProps {
  typed: string | null;
  setTyped: React.Dispatch<React.SetStateAction<string | null>>;
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
}
export const SearchModal: React.FC<SearchModalProps> = ({
  typed,
  setTyped,
  page,
  setPage,
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
    const sportSearch = sports.map((e) => new SportEntry(e));

    // filter games and wrap into SearchEntry
    const gameSearch = getThemeNames().map((e) => new GameEntry(e));
    const searchData = [...sportSearch, ...gameSearch];
    const gameFuse = new Fuse(searchData, {
      threshold: 0.5,
      keys: ['getNames'],
      getFn: (e: SearchEntry) => e.getNames().join(' '),
    });
    return gameFuse.search(typed).map((result) => result.item);
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
        justifyContent: 'space-evenly',
        width: '100%',
        height: '80%',
      }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <SearchCardButton page={page} setPage={setPage} />
      </Box>
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
          width: '80%',
          maxWidth: 600,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '50vw',
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
                {filteredSearch[i]!.displayName()}
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
                <Box width={1 / 5}></Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: '300', width: 3 / 5, textAlign: 'center' }}
                >
                  {filteredSearch[i]!.displayName()}
                </Typography>
                <Box
                  width={1 / 5}
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
