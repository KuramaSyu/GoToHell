import { alpha, Box, Fade, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useSportStore } from '../../useSportStore';
import { useDeathAmountStore } from '../NumberSlider';
import { OverdueDeaths } from '../OverdueDeaths';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';

export const SecondaryTabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isXL } = useBreakpoint();
  const { calculator } = useCalculatorStore();
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountStore();
  const { overdueDeathsList } = useOverdueDeathsStore();

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
      (x) => x.game === currentSport.game && x.count > 0
    ) || null;

  var amountOfTabs = 0;
  if (!isXL) amountOfTabs += 1;
  if (currentOverdueDeaths) amountOfTabs += 1;

  return (
    <Fade in={amountOfTabs > 0} timeout={1000}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flexShrink: 1,
          flexGrow: 0,
          alignItems: 'center',
        }}
      >
        <Tabs
          onChange={handleChange}
          value={activeTab}
          textColor="primary"
          indicatorColor="primary"
          centered
          sx={{
            backgroundColor: alpha('#000000', 0.2),
            borderRadius: '50px',
            padding: '5px',
            backdropFilter: 'blur(10px)',
            p: 1,
            px: 3,
            width: 'fit-content',
          }}
        >
          <Tab
            label="Overdue Deaths"
            sx={{ minWidth: isXL ? 150 : 100, width: 'auto' }}
          />

          {!isXL ? (
            <Tab
              label="Calculation"
              sx={{ minWidth: isXL ? 150 : 100, width: 'auto' }}
            />
          ) : null}
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
              <OverdueDeaths />
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
                amount
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};
