import { Box, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

export interface SearchModalProps {
  typed: String | null;
}
export const SearchModal: React.FC<SearchModalProps> = ({ typed }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    console.log('Search query:', event.target.value); // Handle search logic here
  };
  return (
    <Box>
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
          width: '100%', // Adjust as needed
          maxWidth: 400, // Example: Limit the max width
        }}
      />
    </Box>
  );
};
