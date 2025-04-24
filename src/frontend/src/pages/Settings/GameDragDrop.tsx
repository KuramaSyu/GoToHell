import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Box, Typography, alpha } from '@mui/material';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import zIndex from '@mui/material/styles/zIndex';
import { getThemeNames, useThemeStore } from '../../zustand/useThemeStore';
import { TwoListDnD } from './TwoListDnD';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { UserPreferences } from '../../models/Preferences';
import { setCookie } from '../../utils/cookies';

export const GameDragDrop = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  // use preferred games, or in case of null, all games
  const [shownGames, setShownGames] = useState<string[]>(
    preferences.ui.displayedGames ?? getThemeNames()
  );
  const [hiddenGames, setHiddenGames] = useState(
    getThemeNames().filter((v) => !shownGames.includes(v))
  );

  const saveListsToCookies = (
    _selectionList: string[],
    targetList: string[]
  ) => {
    const uiList = targetList.length > 0 ? targetList : null;

    const newPreferences: UserPreferences = {
      ...preferences,
      ui: {
        ...preferences.ui,
        displayedGames: uiList,
      },
    };
    setPreferences(newPreferences);
    setCookie('preferences', JSON.stringify(newPreferences), 999);
  };
  return (
    <TwoListDnD
      listA={hiddenGames}
      listB={shownGames}
      setListA={setHiddenGames}
      setListB={setShownGames}
      saveChange={saveListsToCookies}
      nameA="Hidden Games"
      nameB="Shown Games"
    ></TwoListDnD>
  );
};
