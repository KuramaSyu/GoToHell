import { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { EquipmentApi } from '../../utils/api/EquipmentApi';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { getEquipmentConfig } from '../../utils/data/Equipment';
import { useEquipmentStore } from '../../zustand/EquipmentStore';
import useFeatureStore, { FeatureFlagName } from '../../zustand/FeatureStore';
import useInfoStore, { SnackbarUpdateImpl } from '../../zustand/InfoStore';

interface SportEquipmentSelectorProps {
  sportID: string | number;
  sportKind: string;
  onChanged?: () => void;
}

/**
 * Lets the user change which equipment is linked to an existing sport entry.
 * Rendered in the sport edit dialog for supported sports (currently jogging).
 */
export const SportEquipmentSelector: React.FC<
  SportEquipmentSelectorProps
> = ({ sportID, sportKind, onChanged }) => {
  const equipmentEnabled = useFeatureStore(
    (state) => state.flags[FeatureFlagName.Equipment].isEnabled(),
  );
  const { equipment, loaded } = useEquipmentStore();
  const { setMessage } = useInfoStore();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [optimisticID, setOptimisticID] = useState<string | null | undefined>(
    undefined,
  );
  const config = getEquipmentConfig(sportKind);

  useEffect(() => {
    if (!equipmentEnabled || !config) return;
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserEquipment)
      .fetchIfNeeded();
  }, [equipmentEnabled, config, loaded]);

  if (!equipmentEnabled || !config || equipment.length === 0) return null;

  const linkedEquipmentIDs = equipment
    .filter((item) =>
      item.linked_sports.some(
        (linked) => String(linked.id) === String(sportID),
      ),
    )
    .map((item) => item.id);
  const selectedID =
    busy && optimisticID !== undefined
      ? optimisticID
      : (linkedEquipmentIDs[0] ?? null);

  const selectEquipment = async (equipmentID: string | null) => {
    if (busyRef.current) return;
    const isAlreadySelected =
      equipmentID === null
        ? linkedEquipmentIDs.length === 0
        : linkedEquipmentIDs.length === 1 &&
          linkedEquipmentIDs[0] === equipmentID;
    if (isAlreadySelected) return;

    busyRef.current = true;
    setOptimisticID(equipmentID);
    setBusy(true);
    try {
      const api = new EquipmentApi();
      if (equipmentID !== null) {
        // The backend replaces an existing link for this sport entry. Link the
        // new shoe first, then clean up links from older equipment as well.
        const linked = await api.linkSports(equipmentID, [String(sportID)]);
        if (!linked) throw new Error('Failed to link equipment');

        for (const oldID of linkedEquipmentIDs) {
          if (oldID === equipmentID) continue;
          try {
            await api.unlinkSport(oldID, String(sportID));
          } catch {
            // The backend may already have removed the old link.
          }
        }
      } else {
        let unlinkedAny = false;
        for (const oldID of linkedEquipmentIDs) {
          try {
            if (await api.unlinkSport(oldID, String(sportID))) {
              unlinkedAny = true;
            }
          } catch {
            // Try the remaining links.
          }
        }
        if (!unlinkedAny) throw new Error('Failed to unlink equipment');
      }
      onChanged?.();
    } catch (error) {
      setMessage(
        new SnackbarUpdateImpl(
          `Updating sport equipment failed: ${String(error)}`,
          'error',
        ),
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
      setOptimisticID(undefined);
    }
  };

  return (
    <Stack direction='column' gap={1}>
      <Stack direction='row' gap={2} alignItems='center'>
        <Typography variant='subtitle2' textTransform='capitalize'>
          {config.singular}
        </Typography>
        {busy && <CircularProgress size={16} />}
      </Stack>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button
          type='button'
          size='small'
          disabled={busy}
          color={selectedID === null ? 'secondary' : 'inherit'}
          variant={selectedID === null ? 'contained' : 'outlined'}
          onClick={(event) => {
            event.stopPropagation();
            void selectEquipment(null);
          }}
          sx={{ textTransform: 'none' }}
        >
          No {config.singular}
        </Button>
        {equipment.map((item) => {
          const selected = selectedID === item.id;
          return (
            <Button
              key={item.id}
              type='button'
              size='small'
              disabled={busy}
              color={selected ? 'secondary' : 'inherit'}
              variant={selected ? 'contained' : 'outlined'}
              onClick={(event) => {
                event.stopPropagation();
                void selectEquipment(item.id);
              }}
              sx={{ textTransform: 'none' }}
            >
              {item.name}
            </Button>
          );
        })}
      </Box>
    </Stack>
  );
};

export default SportEquipmentSelector;
