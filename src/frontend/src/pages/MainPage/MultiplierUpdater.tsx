import { useEffect } from 'react';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { useSportStore } from '../../useSportStore';

export const MultiplierUpdater = () => {
  const { theme } = useThemeStore();
  const { currentSport, setSport } = useSportStore();
  const { sportResponse } = useSportResponseStore();
  // when game changes: change game multiplier and maybe change currentSport
  useEffect(() => {
    if (sportResponse?.games && theme.custom.themeName != currentSport?.game) {
      const gameMultiplierValue = sportResponse.games[theme.custom.themeName];

      if (gameMultiplierValue != null) {
        setSport({
          ...currentSport,
          game: theme.custom.themeName,
          game_multiplier: gameMultiplierValue,
        });
      }
    }
    console.log(sportResponse);
  }, [sportResponse, theme.custom.themeName, currentSport, setSport]);

  return null;
};
