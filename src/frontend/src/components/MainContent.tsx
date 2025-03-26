import React from 'react';
import { Box } from '@mui/material';
import { GameSelector, AmountDisplay } from './GameSelect';
import { NumberSlider } from './NumberSlider';
import { UploadScore } from './UploadScore';
import { TotalScoreDisplay } from './TotalScoreDisplay';
import { SportSelector } from './SportSelect';
import { RecentSports } from './RecentSports/TabView';
import { useThemeStore } from '../zustand/useThemeStore';

interface MainContentProps {
  theme: any;
}

const MainContent: React.FC = () => {
  const { theme } = useThemeStore();
  return (
    <Box
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '95vh',
        justifyContent: 'space-between',
      }}
    >
      {/* top row */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          justifyItems: 'center',
          px: 5,
          maxHeight: 1 / 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TotalScoreDisplay />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AmountDisplay />
        </Box>
      </Box>

      {/* box for middle row */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-around',
          // p: 2,
          minHeight: 0,
        }}
      >
        {/* Game Selection */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 1 / 3,
          }}
        >
          <GameSelector />
        </Box>

        {/* Death Slider and Upload */}
        <Box
          sx={{
            width: 1 / 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <NumberSlider withInput={theme.custom.themeName === 'custom'} />
          <Box
            sx={{
              display: 'flex',
              // flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <UploadScore />
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            maxWidth: 1 / 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SportSelector />
        </Box>
      </Box>
      {/* Box for History row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          zIndex: 1,
          height: 1 / 3,
        }}
      >
        <RecentSports></RecentSports>
      </Box>
    </Box>
  );
};

export default MainContent;
