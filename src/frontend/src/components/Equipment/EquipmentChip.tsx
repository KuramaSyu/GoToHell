import React from 'react';
import { Chip } from '@mui/material';

interface EquipmentChipProps {
  label: string;
  selected: boolean;
  /** Adds more vertical padding, used in the non-compact selector. */
  roomy?: boolean;
  onClick: () => void;
}

/**
 * Chip used to pick (or explicitly unset) the equipment of a sport. Shared by
 * the quick action selector and the upload confirmation dialog so both look
 * identical.
 */
export const EquipmentChip: React.FC<EquipmentChipProps> = ({
  label,
  selected,
  roomy = false,
  onClick,
}) => (
  <Chip
    clickable
    label={label}
    color={selected ? 'secondary' : 'default'}
    variant={selected ? 'filled' : 'outlined'}
    onClick={onClick}
    sx={{
      height: 'auto',
      py: roomy ? 0.75 : 0.25,
      px: roomy ? 1 : 0.5,
      '& .MuiChip-label': {
        px: roomy ? 1.5 : 1,
        py: 0,
      },
    }}
  />
);

export default EquipmentChip;
