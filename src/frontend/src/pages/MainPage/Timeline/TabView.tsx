import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, Tab, Box, Stack } from '@mui/material';
import { MultiplierSettings } from '../../../pages/Settings/Multiplier';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { SecondaryTabView } from './SecondaryTabView';
import { hexToRgbString } from '../../../utils/colors/hexToRgb';
import { useOverdueDeathsStore } from '../../../zustand/OverdueDeathsStore';
import { useSportStore } from '../../../useSportStore';
import useFeatureStore, { FeatureFlagName } from '../../../zustand/FeatureStore';
import { EquipmentSelector } from '../../../components/Equipment/EquipmentSelector';
import { isEquipmentSport } from '../../../utils/data/Equipment';
import { useEquipmentStore } from '../../../zustand/EquipmentStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../../utils/api/ApiRequirementsBuilder';

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
  const { currentSport } = useSportStore();
  const { equipment } = useEquipmentStore();
  const equipmentEnabled = useFeatureStore(
    (state) => state.flags[FeatureFlagName.Equipment].isEnabled(),
  );
  const equipmentSport = isEquipmentSport(currentSport.sport);
  const showEquipmentSelector =
    equipmentEnabled && equipmentSport && equipment.length > 0;
  useEffect(() => {
    if (!equipmentEnabled || !equipmentSport) return;
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserEquipment)
      .fetchIfNeeded();
  }, [equipmentEnabled, equipmentSport]);

  const hasCurrentOverdueDeaths = useMemo(
    () =>
      overdueDeathsList.some(
        (x) => x.game === theme.custom.themeName && x.count > 0,
      ),
    [overdueDeathsList, theme.custom.themeName],
  );

  return (
    <Stack direction={'row'} px={2} spacing={2} alignItems={'center'}>
      {showEquipmentSelector && (
        <Box
          sx={{
            flex: '0 0 calc(100% * 5 / 13)',
            minWidth: 0,
            alignSelf: 'stretch',
            display: 'flex',
          }}
        >
          <EquipmentSelector />
        </Box>
      )}
      <Stack
        direction={'column'}
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <MultiplierSettings />
      </Stack>

      {SecondaryTabViewExists(
        theme.custom.themeName,
        hasCurrentOverdueDeaths,
      ) && (
        <Box sx={{ flex: '0 0 33%', zIndex: 1, minWidth: 0 }}>
          <SecondaryTabView />
        </Box>
      )}
    </Stack>
  );
};
