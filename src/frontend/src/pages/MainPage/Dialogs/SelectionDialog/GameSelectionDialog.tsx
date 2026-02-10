import { useMemo } from 'react';
import { useSportResponseStore } from '../../../../zustand/sportResponseStore';
import { DialogStateProps, SelectionDialog } from './SelectionDialog';
import {
  GameEntry,
  SearchEntry,
  SportEntry,
} from '../../QuickActions/SearchEntry';
import { UserPreferences } from '../../../../models/Preferences';
import usePreferenceStore from '../../../../zustand/PreferenceStore';
import { getValidGames } from '../../GameSelect';
import { getThemeNames } from '../../../../zustand/useThemeStore';

export interface GameSelectionDialogProps {
  state: DialogStateProps;
}

export const GameSelectionDialog: React.FC<GameSelectionDialogProps> = ({
  state: { open, setOpen },
}) => {
  const { preferences, setPreferences } = usePreferenceStore();
  const games: GameEntry[] = useMemo(() => {
    var preferredEntries =
      preferences.ui.displayedGames?.map(
        (s) => new GameEntry(s.name, s.isDisplayed),
      ) ?? [];

    const notSelected = getThemeNames()
      .filter((game) => !preferredEntries.some((entry) => entry.name === game))
      .map((game) => new GameEntry(game, false));
    return [...preferredEntries, ...notSelected];
  }, [preferences]);

  // save newly sorted list to cookies
  const saveListsToCookies = (targetList: SearchEntry[]) => {
    const uiList = targetList.length > 0 ? targetList : null;

    const newPreferences: UserPreferences = {
      ...preferences,
      ui: {
        ...preferences.ui,
        displayedGames: uiList,
      },
    };
    setPreferences(newPreferences);
  };

  return (
    <SelectionDialog
      title='Game Overview'
      list={games}
      saveChange={saveListsToCookies}
      state={{ open, setOpen }}
    />
  );
};
