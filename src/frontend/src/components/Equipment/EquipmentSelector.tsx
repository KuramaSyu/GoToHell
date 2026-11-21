import { useEffect, useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useSportStore } from '../../useSportStore';
import { useEquipmentStore } from '../../zustand/EquipmentStore';
import useFeatureStore, { FeatureFlagName } from '../../zustand/FeatureStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { getEquipmentConfig } from '../../utils/data/Equipment';
import { useThemeStore } from '../../zustand/useThemeStore';
import { BoxElevation2 } from '../../theme/statics';

interface EquipmentSelectorProps {
  /** Hide the heading and make the buttons more compact (used in Quick Actions). */
  compact?: boolean;
}

/**
 * Toggle button group to choose the equipment used for the current sport.
 * "No equipment" is an explicit option as well. The preferred equipment from
 * the backend is preselected automatically.
 */
export const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  compact = false,
}) => {
  const { theme } = useThemeStore();
  const { currentSport } = useSportStore();
  const { equipment, loaded, selectionBySport, selectEquipment } =
    useEquipmentStore();
  const equipmentEnabled = useFeatureStore(
    (state) => state.flags[FeatureFlagName.Equipment].isEnabled(),
  );

  const sport = currentSport.sport;
  const config = getEquipmentConfig(sport);
  const selection = sport ? selectionBySport[sport] : undefined;

  useEffect(() => {
    if (!equipmentEnabled || !config) return;
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserEquipment)
      .fetchIfNeeded();
  }, [equipmentEnabled, config, loaded]);

  useEffect(() => {
    if (!equipmentEnabled || !config || !sport || !loaded) return;
    if (selection === undefined) {
      const preferred = equipment.find(
        (item) => item.preferred_for_sport === sport,
      );
      selectEquipment(sport, preferred?.id ?? null);
    } else if (
      selection !== null &&
      !equipment.some((item) => item.id === selection)
    ) {
      const preferred = equipment.find(
        (item) => item.preferred_for_sport === sport,
      );
      selectEquipment(sport, preferred?.id ?? null);
    }
  }, [equipmentEnabled, config, sport, loaded, equipment, selection]);

  const selectedID = useMemo(() => {
    if (!sport) return null;
    if (selection !== undefined) return selection;
    return (
      equipment.find((item) => item.preferred_for_sport === sport)?.id ?? null
    );
  }, [equipment, selection, sport]);

  if (!equipmentEnabled || !config) return null;

  return (
    <Box
      sx={{
        width: '100%',
        height: compact ? 'auto' : '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(!compact
          ? {
              ...BoxElevation2(theme),
              p: 3,
              borderRadius: 1,
            }
          : {}),
      }}
    >
      <Stack
        direction='column'
        gap={1}
        sx={{
          width: '100%',
          height: compact ? 'auto' : '100%',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Chip
            clickable
            label={`No ${config.singular}`}
            color={selectedID === null ? 'secondary' : 'default'}
            variant={selectedID === null ? 'filled' : 'outlined'}
            onClick={() => {
              if (!sport) return;
              selectEquipment(sport, null);
            }}
            sx={{
              height: 'auto',
              py: compact ? 0.25 : 0.75,
              px: compact ? 0.5 : 1,
              '& .MuiChip-label': {
                px: compact ? 1 : 1.5,
                py: 0,
              },
            }}
          />
          {equipment.map((item) => {
            const selected = selectedID === item.id;
            return (
              <Chip
                key={item.id}
                clickable
                label={item.name}
                color={selected ? 'secondary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => {
                  if (!sport) return;
                  selectEquipment(sport, item.id);
                }}
                sx={{
                  height: 'auto',
                  py: compact ? 0.25 : 0.75,
                  px: compact ? 0.5 : 1,
                  '& .MuiChip-label': {
                    px: compact ? 1 : 1.5,
                    py: 0,
                  },
                }}
              />
            );
          })}
        </Box>
        {!compact && equipment.length === 0 && (
          <Typography variant='caption' color='text.secondary'>
            Add your {config.label.toLowerCase()} in the settings of the{' '}
            equipment overview in the top bar.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default EquipmentSelector;
