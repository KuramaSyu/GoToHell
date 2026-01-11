import { Box, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { animated } from 'react-spring';
import { handleInputChanged } from './Main';
import { QuickActionAutocomplete } from './Autocomplete';

export const AnimatedBox = animated(Box);

export interface SearchModalProps {
  typed: string | null;
  setTyped: React.Dispatch<React.SetStateAction<string | null>>;
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Sub Component of QuickActions which contains the textfield
 */
export const QuickActionsSearch: React.FC<SearchModalProps> = ({
  typed,
  setTyped,
  page,
  setPage,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-evenly',
        width: '100%',
        height: '80%',
      }}
    >
      <TextField
        autoFocus
        value={typed}
        variant="outlined"
        placeholder="Search..."
        onChange={(event) => {
          handleInputChanged(event, setTyped, page);
        }}
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
      <QuickActionAutocomplete
        page={page}
        setPage={setPage}
        setTyped={setTyped}
        typed={typed}
      />
    </Box>
  );
};
