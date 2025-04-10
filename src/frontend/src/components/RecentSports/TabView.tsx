import React, { useState } from 'react';
import { Tabs, Tab, Box, useMediaQuery } from '@mui/material';
import { RecentSportsStandard } from './Standard';
import { MultiplierSettings } from '../../pages/Settings/Multiplier';
import { useSportStore } from '../../useSportStore';
import { useDeathAmountState } from '../NumberSlider';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useThemeStore } from '../../zustand/useThemeStore';

export const RecentSports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountState();
  const { calculator } = useCalculatorStore();
  const { theme } = useThemeStore();

  const BelowXL = useMediaQuery(theme.breakpoints.down('xl'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="left"
        alignContent="left"
        sx={{ width: 4 / 5 }}
      >
        <Box display="flex" justifyContent="center">
          <Tabs
            value={activeTab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Recent Activities"
              sx={{ minWidth: 150, width: 'auto' }}
            />
            <Tab label="Multiplier" sx={{ minWidth: 150, width: 'auto' }} />
          </Tabs>
        </Box>
        <Box mt={2} display={'flex'} justifyContent="center" width={'100%'}>
          {activeTab === 0 && <RecentSportsStandard />}
          {activeTab === 1 && (
            <Box sx={{ width: '100%' }}>
              <MultiplierSettings />
            </Box>
          )}
        </Box>
      </Box>
      {BelowXL
        ? calculator.make_box(currentSport.sport!, currentSport.game!, amount)
        : null}
    </Box>
  );
};
