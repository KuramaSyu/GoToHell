import { Box } from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import {
  NumberCardButton,
  SearchCardButton,
  UploadCardButton,
} from './QuickActionEntries';
import { ICON_QICK_ACTION_SX, QuickActionEntry } from './Main';

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
      <NumberCardButton />
      <SearchCardButton />
      <UploadCardButton />
    </Box>
  );
};
