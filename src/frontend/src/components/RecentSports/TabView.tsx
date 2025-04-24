import React, { useState } from 'react';
import { Tabs, Tab, Box, useMediaQuery, alpha } from '@mui/material';
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
        gap: 1,
        px: 2,
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="left"
        alignContent="left"
        sx={{ width: 7 / 10 }}
      >
        <Box display="flex" justifyContent="center">
          <Tabs
            value={activeTab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              backgroundColor: alpha(
                theme.palette.getContrastText(theme.palette.primary.main),
                0.2
              ),
              borderRadius: '50px',
              padding: '5px',
            }}
          >
            <Tab
              label="Recent Activities"
              sx={{ minWidth: 150, width: 'auto' }}
            />
            <Tab label="Multiplier" sx={{ minWidth: 150, width: 'auto' }} />
          </Tabs>
        </Box>
        <Box mt={2} display={'flex'} justifyContent="center" width={'100%'}>
          {activeTab === 0 && (
            <RecentSportsStandard
              key={`recent-${activeTab}`}
              this_tab={0}
              current_tab={activeTab}
            />
          )}
          {activeTab === 1 && (
            <Box sx={{ width: '100%' }}>
              <MultiplierSettings />
            </Box>
          )}
        </Box>
      </Box>

      {BelowXL ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'right',
            flexGrow: '1',
          }}
        >
          {calculator.make_box(currentSport.sport!, currentSport.game!, amount)}
        </Box>
      ) : null}
    </Box>
  );
};
