import React, { useMemo, useState } from 'react';
import { Tabs, Tab, Box, Stack } from '@mui/material';
import { MultiplierSettings } from '../../../pages/Settings/Multiplier';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { SecondaryTabView } from './SecondaryTabView';
import { hexToRgbString } from '../../../utils/colors/hexToRgb';
import { useOverdueDeathsStore } from '../../../zustand/OverdueDeathsStore';

const SecondaryTabViewExists = (
  themeName: string,
  hasCurrentOverdueDeaths: boolean,
) => {
  // simplified more intelligent version without tabs
  return hasCurrentOverdueDeaths;
};

export const RecentSports = () => {
  const { theme } = useThemeStore();
  const { overdueDeathsList } = useOverdueDeathsStore();
  const hasCurrentOverdueDeaths = useMemo(
    () =>
      overdueDeathsList.some(
        (x) => x.game === theme.custom.themeName && x.count > 0,
      ),
    [overdueDeathsList, theme.custom.themeName],
  );

  return (
    <Stack direction={'row'} px={2} spacing={2} alignItems={'center'}>
      <Stack
        direction={'column'}
        sx={{
          width: SecondaryTabViewExists(
            theme.custom.themeName,
            hasCurrentOverdueDeaths,
          )
            ? 2 / 3
            : 1,
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <MultiplierSettings />
      </Stack>

      {SecondaryTabViewExists(
        theme.custom.themeName,
        hasCurrentOverdueDeaths,
      ) && (
        <Box width={1 / 3} zIndex={1}>
          <SecondaryTabView />
        </Box>
      )}
    </Stack>
  );
};
