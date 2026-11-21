import { useState } from 'react';
import { Box, SvgIcon, Tooltip, TypographyVariant } from '@mui/material';
import { useSportStore } from '../../useSportStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { BoxHoverPropsTopBar } from '../../theme/statics';
import { getEquipmentConfig } from '../../utils/data/Equipment';
import { EquipmentBubble } from './EquipmentBubble';
import { EquipmentModal } from './EquipmentModal';
import ShoeIcon from '../../assets/shoe-running.svg?react';

export interface EquipmentSynopsisProps {
  typographyVariant: TypographyVariant;
}

/**
 * Top bar pill for equipment usage. It is only rendered for sports which have
 * equipment tracking configured (currently jogging -> shoes).
 *
 * MUI's interactive Tooltip keeps the bubble open while either the icon or the
 * bubble itself is hovered, which is exactly the desired behavior. The modal is
 * rendered outside the Tooltip so it stays open when the tooltip closes.
 */
export const EquipmentSynopsis: React.FC<EquipmentSynopsisProps> = ({
  typographyVariant,
}) => {
  const { currentSport } = useSportStore();
  const { theme } = useThemeStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const sport = currentSport.sport;
  const config = getEquipmentConfig(sport);

  if (!config || !sport) return null;

  return (
    <>
      <Tooltip
        title={
          <EquipmentBubble
            sport={sport}
            onOpenSettings={() => {
              setTooltipOpen(false);
              setSettingsOpen(true);
            }}
          />
        }
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        placement='bottom'
        enterDelay={100}
        leaveDelay={0}
        slotProps={{
          tooltip: {
            sx: {
              p: 0,
              maxWidth: 'none',
              backgroundColor: 'transparent',
            },
          },
          popper: {
            sx: {
              pointerEvents: 'auto',
            },
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            px: theme.spacing(2),
            borderRadius: theme.shape.borderRadius,
            color: theme.palette.primary.light,
            cursor: 'pointer',
            ...BoxHoverPropsTopBar(theme),
          }}
        >
          <SvgIcon
            component={ShoeIcon}
            inheritViewBox
            sx={{
              fontSize: theme.typography[typographyVariant].fontSize,
              color: theme.palette.primary.light,
              transition: theme.colorTransition.root.transition,
            }}
          />
        </Box>
      </Tooltip>

      <EquipmentModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultSport={sport}
      />
    </>
  );
};

export default EquipmentSynopsis;
