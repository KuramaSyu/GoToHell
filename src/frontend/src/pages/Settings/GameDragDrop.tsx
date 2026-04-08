import { useState } from 'react';
import { getThemeNames } from '../../zustand/useThemeStore';
import { TwoListDnD } from './TwoListDnD';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { UserPreferences } from '../../models/Preferences';

export const GameDragDrop = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  // use preferred games, or in case of null, all games
  const [shownGames, setShownGames] = useState<string[]>(
    preferences.ui.displayedGames?.map((game) => game.name) ?? getThemeNames(),
  );
  const [hiddenGames, setHiddenGames] = useState(
    getThemeNames().filter((v) => !shownGames.includes(v)),
  );

  const saveListsToCookies = (
    _selectionList: string[],
    targetList: string[],
  ) => {
    const uiList = targetList.length > 0 ? targetList : null;

    const newPreferences: UserPreferences = {
      ...preferences,
      ui: {
        ...preferences.ui,
        displayedGames:
          uiList?.map((game) => ({ name: game, isDisplayed: true })) ?? null,
      },
    };
    setPreferences(newPreferences);
  };
  return (
    <TwoListDnD
      listA={hiddenGames}
      listB={shownGames}
      setListA={setHiddenGames}
      setListB={setShownGames}
      saveChange={saveListsToCookies}
      nameA='Hidden Games'
      nameB='Shown Games'
    ></TwoListDnD>
  );
};
