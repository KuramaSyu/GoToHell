import { useMemo } from 'react';
import { useSportResponseStore } from '../../../../zustand/sportResponseStore';
import { DialogStateProps, SelectionDialog } from './SelectionDialog';
import { SearchEntry, SportEntry } from '../../QuickActions/SearchModal';
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
    var basicEntries =
      preferences.ui.displayedSports?.map(
        (s) => new SportEntry(s.name, s.isDisplayed)
      ) ?? [];
    const notSelected = Object.keys(sportResponse.sports)
      .filter((sport) => !basicEntries.some((entry) => entry.name === sport))
      .map((sport) => new SportEntry(sport, false));
    return [...basicEntries, ...notSelected];
  }, [sportResponse, preferences]);

  // save newly sorted list to cookies
  const saveListsToCookies = (targetList: SearchEntry[]) => {
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
      saveChange={saveListsToCookies}
      state={{ open, setOpen }}
    />
  );
};
