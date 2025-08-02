import { useMemo } from 'react';
import { useSportResponseStore } from '../../../../zustand/sportResponseStore';
import { DialogStateProps, SelectionDialog } from './SelectionDialog';
import { SportEntry } from '../../QuickActions/SearchModal';

export interface SportSelectionDialogProps {
  state: DialogStateProps;
}

export const SportSelectionDialog: React.FC<SportSelectionDialogProps> = ({
  state: { open, setOpen },
}) => {
  const { sportResponse } = useSportResponseStore();
  const sports: SportEntry[] = useMemo(() => {
    if (!sportResponse || !sportResponse.sports) return [];
    return Object.keys(sportResponse.sports).map((s) => new SportEntry(s));
  }, [sportResponse]);

  return (
    <SelectionDialog
      title="Select Sports"
      list={sports}
      saveChange={(list) => console.log(list)}
      state={{ open, setOpen }}
    />
  );
};
