import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { GameSelector } from './GameSelect';
import { NumberSlider } from './NumberSlider';
import { UploadScore } from './UploadScore';
import { TotalScoreDisplay } from './TotalScoreDisplay';
import { SportSelector } from './SportSelect';
import { RecentSports } from './RecentSports/TabView';
import { useThemeStore } from '../zustand/useThemeStore';
import { AmountDisplay } from './AmountDisplay';

interface MainContentProps {
  theme: any;
}

const MainContent: React.FC = () => {
  const { theme } = useThemeStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '92vh',
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
            px: 1,
            height: 1 / 5,
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
            flexDirection: 'column',
            width: '100%',
            flexGrow: 1,
            justifyContent: 'space-around',
          }}
        >
          {/* Game Selection */}
          <Box sx={{ display: 'flex' }}>
            <GameSelector />
          </Box>

          {/* Death Slider and Upload */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 1,
              maxHeight: 1 / 5,
            }}
          >
            <Box sx={{ width: 3 / 4 }}>
              <NumberSlider withInput={theme.custom.themeName === 'custom'} />
            </Box>
            <Box
              sx={{
                width: 1 / 4,
                display: 'flex',
                alignItems: 'center',
                px: 1,
              }}
            >
              <UploadScore />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SportSelector />
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '92vh',
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
          pt: 2,
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
          flexDirection: isMobile ? 'column' : 'row',
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
          pb: 2,
          // height: 1 / 4,
        }}
      >
        <RecentSports></RecentSports>
      </Box>
    </Box>
  );
};

export default MainContent;
