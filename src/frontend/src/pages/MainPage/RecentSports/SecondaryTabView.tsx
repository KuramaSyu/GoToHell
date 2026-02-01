import { alpha, Box, Fade, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import useCalculatorStore from '../../../zustand/CalculatorStore';
import { useSportStore } from '../../../useSportStore';
import { useDeathAmountStore } from '../NumberSlider';
import { OverdueDeathsDisplay } from '../OverdueDeathsDisplay';
import { useOverdueDeathsStore } from '../../../zustand/OverdueDeathsStore';
import { useThemeStore } from '../../../zustand/useThemeStore';

export const SecondaryTabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isXL } = useBreakpoint();
  const { calculator } = useCalculatorStore();
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountStore();
  const { overdueDeathsList } = useOverdueDeathsStore();
  const { theme } = useThemeStore();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const currentOverdueDeaths =
      overdueDeathsList.find((x) => x.game === currentSport.game) || null;
    if (currentOverdueDeaths && currentOverdueDeaths.count > 0) {
      setActiveTab(0);
    } else if (!isXL) {
      setActiveTab(1);
    }
  }, [currentSport, overdueDeathsList]);
  const currentOverdueDeaths =
    overdueDeathsList.find(
      (x) => x.game === currentSport.game && x.count > 0,
    ) || null;

  var amountOfTabs = 0;
  if (!isXL) amountOfTabs += 1;
  if (currentOverdueDeaths) amountOfTabs += 1;

  // simplified more intelligent version without tabs
  if (theme.custom.themeName === 'custom') {
    return null;
  }
  return (
    <Fade in={amountOfTabs > 0} timeout={1000}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          flexShrink: 1,
          flexGrow: 0,
        }}
      >
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            position: 'relative',
            width: '100%',
            justifyContent: 'center',
            minHeight: 129,
            overflow: 'hidden',
          }}
        >
          {activeTab == 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: '1',
              }}
            >
              <OverdueDeathsDisplay />
            </Box>
          )}
          {activeTab == 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'end',
                flexGrow: '1',
              }}
            >
              {calculator.make_box(
                currentSport.sport!,
                currentSport.game!,
                amount,
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
  return (
    <Fade in={amountOfTabs > 0} timeout={1000}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          flexShrink: 1,
          flexGrow: 0,
        }}
      >
        <Tabs
          onChange={handleChange}
          value={activeTab}
          textColor='primary'
          indicatorColor='primary'
          orientation='vertical'
          centered
          sx={{
            backgroundColor: alpha(theme.palette.muted.dark, 0.33),
            borderRadius: '16px',
            padding: '5px',
            backdropFilter: 'blur(16px)',
            width: 'fit-content',
          }}
        >
          <Tab label='Overdue Deaths' />

          {!isXL ? <Tab label='Calculation' /> : null}
        </Tabs>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            position: 'relative',
            width: '100%',
            justifyContent: 'center',
            minHeight: 129,
            overflow: 'hidden',
          }}
        >
          {activeTab == 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: '1',
              }}
            >
              <OverdueDeathsDisplay />
            </Box>
          )}
          {activeTab == 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'end',
                flexGrow: '1',
              }}
            >
              {calculator.make_box(
                currentSport.sport!,
                currentSport.game!,
                amount,
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};
