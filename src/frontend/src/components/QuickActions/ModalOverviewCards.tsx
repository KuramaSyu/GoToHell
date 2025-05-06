import { Box } from '@mui/material';
import { ICON_QICK_ACTION_SX, QuickActionEntry } from './QuckActionMenu';
import AbcIcon from '@mui/icons-material/Abc';
import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { UploadCardButton } from './UploadButton';

export const ModalOverview: React.FC = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        py: 2,
      }}
    >
      <QuickActionEntry
        keys="Any Number"
        title="Deaths"
        icon={<DialpadIcon sx={ICON_QICK_ACTION_SX} />}
      />
      <QuickActionEntry
        keys="Any Letter"
        title="Sport or Game"
        icon={<AbcIcon sx={ICON_QICK_ACTION_SX} />}
      />
      <UploadCardButton></UploadCardButton>
    </Box>
  );
};
