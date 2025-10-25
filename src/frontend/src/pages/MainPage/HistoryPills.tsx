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
import { useDeathAmountStore } from './NumberSlider';
import { useSportStore } from '../../useSportStore';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useUserStore } from '../../userStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';

const MAX_PILLS = 4;

export const HistoryPills: React.FC = () => {
  const { recentSports } = useRecentSportsStore();
  const { theme, setTheme } = useThemeStore();
  const { setAmount: setDeathAmount } = useDeathAmountStore();
  const { setSport } = useSportStore();
  const { getSportMultiplier } = useSportResponseStore();

  const usersLatestSportRecords: SportRow[] = useMemo(() => {
    // on mobile these are currently not updated - only fetched
    // once which is theoretically enough. Updates for this
    // component is not really worth the amount of REST-requests
    // which are normally done each 30s within the timeline
    if (recentSports === null) {
      return [];
    }

    const user = useUserStore.getState().user;

    var sports: SportRow[] = [];
    // JS uses === (camparing by Address rather than value),
    // so Set<SportRow> resulted in duplicates -- WTF
    var seen = new Set<string>();
    for (const sport of recentSports.data.toReversed()) {
      if (sport.user_id !== user?.id) {
        continue;
      }
      const sportRow = new SportRow(sport.kind, sport.game, sport.amount);

      if (!seen.has(sportRow.hash())) {
        seen.add(sportRow.hash());
        sports.push(sportRow);
      }
      if (sports.length >= MAX_PILLS) {
        break;
      }
    }
    return Array.from(sports);
  }, [recentSports]);

  const SportRowMatchesCurrentSettings = (sportRow: SportRow): boolean => {
    const currentSport = useSportStore.getState().currentSport;
    const calculator = useCalculatorStore.getState().calculator;
    const amount = calculator.calculate_amount(
      sportRow.kind,
      sportRow.game,
      useDeathAmountStore.getState().amount
    );
    return (
      sportRow.kind === currentSport.sport &&
      sportRow.game === currentSport.game &&
      sportRow.amount === amount
    );
  };

  const handleChipClick = async (sportRow: SportRow) => {
    // Handle chip click event
    await setTheme(sportRow.game as keyof CustomTheme);
    const currentSport = useSportStore.getState().currentSport;
    const multiplier = getSportMultiplier(sportRow.kind);
    setSport({
      ...currentSport,
      sport: sportRow.kind,
      sport_multiplier: multiplier.multiplier,
    });
    const calculator = useCalculatorStore.getState().calculator;
    setDeathAmount(
      calculator.calculate_deaths(sportRow.kind, sportRow.game, sportRow.amount)
    );
  };

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {usersLatestSportRecords.map((sportRow, index) => (
        <Chip
          key={index}
          label={`${sportRow.amount} @ ${sportRow.game}`}
          onClick={() => handleChipClick(sportRow)}
          color={
            SportRowMatchesCurrentSettings(sportRow) ? 'primary' : 'default'
          }
          avatar={
            <img
              src={sportIconMap[String(sportRow.kind)]}
              alt={sportRow.kind}
              width={24}
              height={24}
              style={{
                backgroundColor: 'transparent',
                filter: isDarkColored(theme, theme.palette.secondary.main)
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
