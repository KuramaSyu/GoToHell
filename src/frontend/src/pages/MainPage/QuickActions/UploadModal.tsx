import { Box, CircularProgress, Typography } from '@mui/material';

import { animated, useSpring } from 'react-spring';

import { SearchModalProps } from './SearchModal';

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
