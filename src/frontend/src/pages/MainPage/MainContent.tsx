import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { GameSelector } from './GameSelect';
import { NumberSlider } from './NumberSlider';
import { UploadScore } from './UploadScore';
import { TotalScoreDisplay } from './TotalScoreDisplay';
import { SportSelector } from './SportSelect';
import { RecentSports } from './RecentSports/TabView';
import { useThemeStore } from '../../zustand/useThemeStore';
import { AmountDisplay } from './AmountDisplay';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { UploadOverdueDeaths } from './UploadOverdueDeaths';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

interface MainContentProps {
  theme: any;
}

const MainContent: React.FC = () => {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedRight: () => navigate('/settings'),
    onSwipedLeft: () => {},
  });

  if (isMobile) {
    return (
      <Box
        {...handlers}
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: '92vh',
          justifyContent: 'space-between',
          touchAction: 'pan-y',
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
          <Box
            sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}
          >
            <GameSelector />
          </Box>

          {/* Death Slider and Upload */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              maxHeight: isMobile ? undefined : 1 / 5,
              height: isMobile ? 1 / 7 : undefined,
              mx: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                width: isMobile ? 3 / 4 : 3 / 4,
                zIndex: 0,
              }}
            >
              <NumberSlider withInput={theme.custom.themeName === 'custom'} />
            </Box>
            <Box
              sx={{
                width: isMobile ? 6 / 20 : 1 / 4,
                display: 'flex',
                alignItems: 'center',
                zIndex: 1,
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
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                // flexDirection: 'row',
                justifyContent: 'center',
                width: 'fit-content',
              }}
            >
              <UploadScore />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '-30%',
                  right: '-12%',

                  zIndex: 1,
                }}
              >
                <UploadOverdueDeaths></UploadOverdueDeaths>
              </Box>
            </Box>
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
