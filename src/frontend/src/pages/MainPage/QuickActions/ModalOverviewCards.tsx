import { Box } from '@mui/material';
import {
  NumberCardButton,
  SearchCardButton,
  UploadCardButton,
  CardButtonProps,
} from './QuickActionEntries';

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
