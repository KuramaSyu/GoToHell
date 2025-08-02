import { useMemo } from 'react';
import { useSportResponseStore } from '../../../../zustand/sportResponseStore';
import { DialogStateProps, SelectionDialog } from './SelectionDialog';
import { SportEntry } from '../../QuickActions/SearchModal';
import { UserPreferences } from '../../../../models/Preferences';
import usePreferenceStore from '../../../../zustand/PreferenceStore';
import { setCookie } from '../../../../utils/cookies';

export interface SportSelectionDialogProps {
  state: DialogStateProps;
}

export const SportSelectionDialog: React.FC<SportSelectionDialogProps> = ({
  state: { open, setOpen },
}) => {
  const { sportResponse } = useSportResponseStore();
  const { preferences, setPreferences } = usePreferenceStore();
  const sports: SportEntry[] = useMemo(() => {
    if (!sportResponse || !sportResponse.sports) return [];
    return Object.keys(sportResponse.sports).map((s) => new SportEntry(s));
  }, [sportResponse]);

  // save newly sorted list to cookies
  const saveListsToCookies = (targetList: string[]) => {
    const uiList = targetList.length > 0 ? targetList : null;

    const newPreferences: UserPreferences = {
      ...preferences,
      ui: {
        ...preferences.ui,
        displayedSports: uiList,
      },
    };
    setPreferences(newPreferences);
    setCookie('preferences', JSON.stringify(newPreferences), 999);
  };

  return (
    <SelectionDialog
      title="Select Sports"
      list={sports}
      saveChange={(list) => saveListsToCookies(list.map((entry) => entry.name))}
      state={{ open, setOpen }}
    />
  );
};
