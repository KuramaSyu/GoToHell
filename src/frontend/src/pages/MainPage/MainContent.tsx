import React from 'react';
import {
  alpha,
  Box,
  Divider,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
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
import { Pages } from '../../components/TopBar';
import { HistoryPills } from './HistoryPills';
import { BoxElevation2 } from '../../theme/statics';
import { TotalScoreHeadline } from './TotalScoreHeadline';
import { NUMBER_FONT } from '../../statics';
import { CalculatorUpdater } from './CalculatorUpdater';
import { MultiplierUpdater } from './MultiplierUpdater';

const MainContent: React.FC = () => {
  const { isMobile } = useBreakpoint();

  return (
    <>
      <CalculatorUpdater />
      <MultiplierUpdater />
      {isMobile ? <MainContentMobile /> : <MainContentDesktop />}
    </>
  );
};

export default MainContent;

const MainContentMobile: React.FC = () => {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedLeft: () => navigate(Pages.FRIENDS),
    onSwipedRight: () => navigate(Pages.HISTORY),
  });

  return (
    <Box
      {...handlers}
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? '100%' : '92vh',
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
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <GameSelector />
          <HistoryPills />
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
            <NumberSlider
              withInput={
                theme.custom.themeName === 'custom' ? 'custom' : 'default'
              }
            />
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
};

const MainContentDesktop: React.FC = () => {
  const { theme } = useThemeStore();

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '92vh',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* top row */}
      <Stack
        direction='column'
        sx={{
          position: 'relative',
          justifyContent: 'space-between',
          justifyItems: 'center',
          alignItems: 'center',
          px: 2,
          pt: 2,
          height: '20%',
        }}
      >
        <Stack
          direction='row'
          sx={{
            ...BoxElevation2(theme),
            width: '100%',
            borderRadius: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: NUMBER_FONT,
            px: 4,
          }}
        >
          <Typography variant='h4' fontFamily='inherit'>
            in total
          </Typography>
          <Divider orientation='vertical' flexItem />
          <TotalScoreHeadline />
          <Divider orientation='vertical' flexItem />
          <Typography variant='h4' fontFamily='inherit'>
            to do now
          </Typography>
        </Stack>
        <Stack
          direction='row'
          sx={{
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TotalScoreDisplay />
          </Box>
          {/* Spacer */}
          <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AmountDisplay />
          </Box>
        </Stack>
      </Stack>

      {/* box for middle row */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          ...BoxElevation2(theme),
          mx: 2,
          py: 2,
          borderRadius: 1,
          minHeight: 0,
          gap: 4,
        }}
      >
        {/* Game Selection */}
        <Tooltip
          title='What game do you play? Custom means real world'
          arrow
          placement='bottom'
        >
          <Box
            sx={{
              flexShrink: 0,
              flexBasis: 'clamp(300px, 33%, 500px)',
              minWidth: '300px',
              maxWidth: '500px',
            }}
          >
            <GameSelector />
          </Box>
        </Tooltip>
        <Divider orientation='vertical' flexItem />

        {/* Death Slider and Upload */}
        <Box
          sx={{
            flexShrink: 0,
            flexBasis: 'clamp(100px, 33%, 1300px)',
            minWidth: '100px',
            maxWidth: '1300px',
            flexGrow: 1,
            alignContent: 'center',
          }}
        >
          <NumberSlider
            withInput={
              theme.custom.themeName === 'custom' ? 'custom' : 'default'
            }
          />
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
        <Divider orientation='vertical' flexItem />

        {/* Sport Selection */}
        <Tooltip title='What sport do you want to do?' arrow placement='bottom'>
          <Box
            sx={{
              flexShrink: 1,
              flexBasis: 'clamp(180px, 25%, 350px)',
              minWidth: '180px',
              maxWidth: '250px',
              alignContent: 'center',
              pr: 2,
            }}
          >
            <SportSelector />
          </Box>
        </Tooltip>
      </Box>
      {/* Box for Multiplier / 3rd info */}
      <Box
        sx={{
          flexShrink: 0,
          height: 'fit-content',
          minHeight: '100px',
          // flexGrow: 1,
          alignContent: 'center',
        }}
      >
        <RecentSports />
      </Box>
    </Box>
  );
};
