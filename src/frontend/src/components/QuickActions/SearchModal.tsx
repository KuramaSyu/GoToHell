import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { animated, useSprings, useTransition } from 'react-spring';

const AnimatedBox = animated(Box);
export interface SearchModalProps {
  typed: String | null;
}
export const SearchModal: React.FC<SearchModalProps> = ({ typed }) => {
  const [searchValue, setSearchValue] = useState('');
  const { sportResponse } = useSportResponseStore();
  const sports = Object.keys(sportResponse?.sports ?? {});
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    console.log('Search query:', event.target.value); // Handle search logic here
  };
  const filteredSports = useMemo(() => {
    if (typed === null) {
      return [];
    }
    return sports.filter((s) => s.toLowerCase().includes(typed!.toLowerCase()));
  }, [typed]);

  const springs = useSprings(
    filteredSports.length,
    filteredSports.map((_, index) => ({
      from: { opacity: 0, transform: 'scale(0.7)' },
      to: { opacity: 1, transform: 'scale(1)' },

      config: { tension: 200, friction: 20 },
    }))
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
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            key={filteredSports[i]}
            style={style}
          >
            <Typography variant="h5" sx={{ fontWeight: '300' }}>
              {filteredSports[i]!.toUpperCase()}
            </Typography>
          </AnimatedBox>
        ))}
      </Box>
    </Box>
  );
};
