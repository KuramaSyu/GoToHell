import React, { useState } from 'react';
import { Tabs, Tab, Box, useMediaQuery, alpha } from '@mui/material';
import { MultiplierSettings } from '../../../pages/Settings/Multiplier';
import { useSportStore } from '../../../useSportStore';
import { useDeathAmountStore } from '../NumberSlider';
import useCalculatorStore from '../../../zustand/CalculatorStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { SecondaryTabView } from './SecondaryTabView';
import { hexToRgbString } from '../../../utils/colors/hexToRgb';

export const RecentSports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentSport } = useSportStore();
  const { amount } = useDeathAmountStore();
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
        sx={{ width: 2 / 3 }}
      >
        <Box display="flex" justifyContent="center">
          <Tabs
            value={activeTab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              backgroundColor: `rgba(${hexToRgbString(
                theme.palette.muted.dark
              )}, 0.33)`,
              borderRadius: '50px',
              padding: '5px',
              backdropFilter: 'blur(10px)',
              p: 1,
            }}
          >
            <Tab label="Multiplier" sx={{ minWidth: 150, width: 'auto' }} />
          </Tabs>
        </Box>
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
          {activeTab === 0 && (
            <Box
              sx={{
                width: '100%',
              }}
            >
              <MultiplierSettings />
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ width: 1 / 3 }}>
        <SecondaryTabView></SecondaryTabView>
      </Box>
    </Box>
  );
};
