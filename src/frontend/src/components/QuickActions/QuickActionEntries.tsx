import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import AbcIcon from '@mui/icons-material/Abc';
import { useSportStore } from '../../useSportStore';
import { ICON_QICK_ACTION_SX, QuickActionEntry } from './QuickActionEntry';

export const UploadCardButton: React.FC = () => {
  return (
    <QuickActionEntry
      keys="Enter"
      title="Upload"
      icon={<KeyboardReturnIcon sx={ICON_QICK_ACTION_SX} />}
    />
  );
};

export const NumberCardButton: React.FC = () => {
  return (
    <QuickActionEntry
      keys="Any Number"
      title="Deaths"
      icon={<DialpadIcon sx={ICON_QICK_ACTION_SX} />}
    />
  );
};

export const SearchCardButton: React.FC = () => {
  return (
    <QuickActionEntry
      keys="Any Letter"
      title="Sport or Game"
      icon={<AbcIcon sx={ICON_QICK_ACTION_SX} />}
    />
  );
};
