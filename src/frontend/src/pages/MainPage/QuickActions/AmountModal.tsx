import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardReturnTwoTone } from '@mui/icons-material';
import { useDeathAmountStore } from '../NumberSlider';
import { isNumeric } from '../../../utils/UserNumber';
import { SearchModalProps } from './SearchModal';
import { NumberCardButton } from './QuickActionEntries';
import { handleInputChanged } from './Main';

export const AmountModal: React.FC<SearchModalProps> = ({
  typed,
  setTyped,
  page,
  setPage,
}) => {
  const { setAmount } = useDeathAmountStore();
  const [error, setError] = useState<null | string>(null);

  // triggerd when clicked or enter pressed
  const onEnter = () => {
    // select first element
    if (!checkIfValid(typed)) {
      setError('Please enter a valid number');
      return;
    }
    setError(null);
    setAmount(Math.round(Number(typed)));
    setTyped(null);
  };

  const checkIfValid = (value: string | null): boolean => {
    return isNumeric(value);
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
  }, [typed]);

  // error box
  const errorBox = useMemo(() => {
    if (error) {
      return (
        <Box>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      );
    }
    return null;
  }, [error]);
  // box with enter icon and Select as text, rounded, with blur
  const selectBox = (
    <Button
      onClick={onEnter}
      variant="outlined"
      sx={{
        height: 'auto',
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
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
        alignItems: 'center',
        justifyItems: 'center',
        justifyContent: 'start',
        flexDirection: 'row',
        width: '100%',
      }}
    >
      <Box sx={{ width: 1 / 4, display: 'flex', justifyContent: 'center' }}>
        <NumberCardButton page={page} setPage={setPage} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          height: '60px',
          gap: 2,
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {errorBox}
          <TextField
            autoFocus
            defaultValue={typed}
            variant="outlined"
            placeholder="Search..."
            onChange={(event) => {
              handleInputChanged(event, setTyped, page);
            }}
            error={!isNumeric(typed)}
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
        </Box>
        {selectBox}
      </Box>
    </Box>
  );
};
