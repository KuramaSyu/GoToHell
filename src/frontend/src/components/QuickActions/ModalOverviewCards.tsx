import { Box } from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import {
  NumberCardButton,
  SearchCardButton,
  UploadCardButton,
  CardButtonProps,
} from './QuickActionEntries';
import { ICON_QICK_ACTION_SX, QuickActionEntry } from './QuickActionEntry';

export enum ModalPages {
  OVERVIEW = 'overview',
  SEARCH_MODAL = 'SearchModal',
  AMOUNT_MODAL = 'AmountModal',
  UPLOAD_MODAL = 'UploadModal',
}
export const ModalOverview: React.FC<CardButtonProps> = ({ page, setPage }) => {
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
      <NumberCardButton page={page} setPage={setPage} />
      <SearchCardButton page={page} setPage={setPage} />
      <UploadCardButton page={page} setPage={setPage} />
    </Box>
  );
};
