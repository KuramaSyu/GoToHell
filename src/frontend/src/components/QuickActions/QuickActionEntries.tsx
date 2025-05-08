import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import AbcIcon from '@mui/icons-material/Abc';
import { useSportStore } from '../../useSportStore';
import { ICON_QICK_ACTION_SX, QuickActionEntry } from './QuickActionEntry';
import { ModalPages } from './ModalOverviewCards';

export interface CardButtonProps {
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
}
export const UploadCardButton: React.FC<CardButtonProps> = ({
  page,
  setPage,
}) => {
  return (
    <QuickActionEntry
      keys="Enter"
      title="Upload"
      icon={<KeyboardReturnIcon sx={ICON_QICK_ACTION_SX} />}
      page={page}
      setPage={setPage}
      navigateToPage=""
    />
  );
};

export const NumberCardButton: React.FC<CardButtonProps> = ({
  page,
  setPage,
}) => {
  return (
    <QuickActionEntry
      keys="Any Number"
      title="Deaths"
      icon={<DialpadIcon sx={ICON_QICK_ACTION_SX} />}
      page={page}
      setPage={setPage}
      navigateToPage={ModalPages.AMOUNT_MODAL}
    />
  );
};

export const SearchCardButton: React.FC<CardButtonProps> = ({
  page,
  setPage,
}) => {
  return (
    <QuickActionEntry
      keys="Any Letter"
      title="Sport / Game"
      icon={<AbcIcon sx={ICON_QICK_ACTION_SX} />}
      page={page}
      setPage={setPage}
      navigateToPage={ModalPages.SEARCH_MODAL}
    />
  );
};
