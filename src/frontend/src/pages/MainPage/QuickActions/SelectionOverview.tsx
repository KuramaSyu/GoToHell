import { Box, darken, Stack, Typography } from '@mui/material';
import { useSportStore } from '../../../useSportStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { useDeathAmountStore } from '../NumberSlider';
import { blendWithContrast } from '../../../utils/blendWithContrast';
import { TitleValuePill } from '../../../components/TitleValuePill';
import { EquipmentSelector } from '../../../components/Equipment/EquipmentSelector';
import useFeatureStore, { FeatureFlagName } from '../../../zustand/FeatureStore';
import { isEquipmentSport } from '../../../utils/data/Equipment';

/**
 * Component to display death amount, theme and sport
 */
export const SelectionOverview: React.FC = () => {
  const { amount } = useDeathAmountStore();
  const { theme } = useThemeStore();
  const { currentSport } = useSportStore();
  const isCustom: boolean = theme.custom.themeName === 'custom';
  const equipmentEnabled = useFeatureStore(
    (state) => state.flags[FeatureFlagName.Equipment].isEnabled(),
  );
  const showEquipment = equipmentEnabled && isEquipmentSport(currentSport.sport);

  return (
    <Stack direction="row" width={'100%'} justifyContent="space-around" mb={2}>
      <Stack direction='row' spacing={2} alignItems='center'>
        <TitleValuePill title="Sport" value={currentSport.sport || 'Not set'} />
        {showEquipment && <EquipmentSelector compact />}
      </Stack>
      <TitleValuePill title="Theme" value={theme.custom.longName} />
      <TitleValuePill
        title={isCustom ? 'Exercises' : 'Deaths'}
        value={amount > 0 ? amount.toString() : 'Not set'}
      />
    </Stack>
  );
};
