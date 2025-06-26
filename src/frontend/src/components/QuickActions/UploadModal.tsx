import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { animated, useSpring, useSprings, useTransition } from 'react-spring';
import { useSportStore } from '../../useSportStore';
import {
  KeyboardReturn,
  KeyboardReturnOutlined,
  KeyboardReturnTwoTone,
} from '@mui/icons-material';
import { useDeathAmountStore } from '../NumberSlider';
import { isNumeric } from '../../utils/UserNumber';
import { isValid } from 'date-fns';
import { SearchModalProps } from './SearchModal';
import { NumberCardButton } from './QuickActionEntries';

const AnimatedDiv = animated('div');

export const UploadModal: React.FC<SearchModalProps> = ({
  typed,
  setTyped,
  page,
  setPage,
}) => {
  // spring for text pulsing
  const textSpring = useSpring({
    loop: { reverse: true },
    from: { opacity: 0.5 },
    to: { opacity: 1 },
    config: { duration: 800 },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        gap: 5,
      }}
    >
      <CircularProgress size={'7vh'} />
      <AnimatedDiv style={textSpring}>
        <Typography variant="h5" mt={2}>
          Uploading...
        </Typography>
      </AnimatedDiv>
    </Box>
  );
};
