import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { useSportStore } from '../../useSportStore';
import { ICON_QICK_ACTION_SX, QuickActionEntry } from './QuckActionEntry';

export const UploadCardButton: React.FC = () => {
  return (
    <QuickActionEntry
      keys="Enter"
      title="Upload"
      icon={<KeyboardReturnIcon sx={ICON_QICK_ACTION_SX} />}
    />
  );
};
