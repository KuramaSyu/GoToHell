import { useState, useEffect, useMemo } from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { getThemeNames, useThemeStore } from '../../zustand/useThemeStore';

import { DynamicGameGrid } from './DynamicGrid';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { CustomTheme } from '../../theme/customTheme';
import { GameSelectionDialog } from './Dialogs/SelectionDialog/GameSelectionDialog';
import { UIElement } from '../../models/Preferences';
import {
  useRecentSportsStore,
  useYourRecentSportsStore,
} from '../../zustand/RecentSportsState';
import SportRow, { Sport } from '../../models/Sport';
import { sportIconMap } from '../../utils/data/Sports';
import { isDarkColored } from '../../utils/blendWithContrast';

const MAX_PILLS = 5;

export const HistoryPills: React.FC = () => {
  const { recentSports } = useRecentSportsStore();
  const { theme } = useThemeStore();
  const lastDone: SportRow[] = useMemo(() => {
    if (recentSports === null) {
      return [];
    }
    var sports: SportRow[] = [];
    for (const sport of recentSports.data.toReversed()) {
      const sportRow = new SportRow(sport.kind, sport.game, sport.amount);
      const isContained = sports.includes(sportRow);
      if (!isContained) {
        sports.push(sportRow);
      }
      if (sports.length >= MAX_PILLS) {
        break;
      }
    }
    return sports;
  }, [recentSports]);

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {lastDone.map((sportRow, index) => (
        <Chip
          key={index}
          label={`${sportRow.amount} @ ${sportRow.game}`}
          avatar={
            <img
              src={sportIconMap[String(sportRow.kind)]}
              alt={sportRow.kind}
              width={24}
              height={24}
              style={{
                filter: isDarkColored(theme, null)
                  ? 'brightness(0) invert(0.8)'
                  : 'none',
              }}
            />
          }
        />
      ))}
    </Stack>
  );
};
