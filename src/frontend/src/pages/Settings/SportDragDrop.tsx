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
import { useThemeStore } from '../../zustand/useThemeStore';
import { TwoListDnD } from './TwoListDnD';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { UserPreferences } from '../../models/Preferences';
import { setCookie } from '../../utils/cookies';

export const SportDragDrop = () => {
  const { sportResponse } = useSportResponseStore();
  const { theme } = useThemeStore();
  const { preferences, setPreferences } = usePreferenceStore();
  // listB are the preferences or all Sports in case of None
  const [listB, setListB] = useState<string[]>(
    preferences.ui.displayedSports ??
      (Object.keys(sportResponse?.sports ?? {}) as string[]) ??
      []
  );
  const [listA, setListA] = useState(
    Object.keys(sportResponse?.sports ?? {}).filter((v) => !listB.includes(v))
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
        displayedSports: uiList,
      },
    };
    setPreferences(newPreferences);
    setCookie('preferences', JSON.stringify(newPreferences), 999);
  };
  return (
    <TwoListDnD
      listA={listA}
      listB={listB}
      setListA={setListA}
      setListB={setListB}
      saveChange={saveListsToCookies}
      nameA="Hidden Sports"
      nameB="Shown Sports"
    ></TwoListDnD>
  );
};
