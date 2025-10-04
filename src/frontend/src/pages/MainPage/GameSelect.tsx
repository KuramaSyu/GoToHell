import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { getThemeNames, useThemeStore } from '../../zustand/useThemeStore';

import { DynamicGameGrid } from './DynamicGrid';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { CustomTheme } from '../../theme/customTheme';
import { GameSelectionDialog } from './Dialogs/SelectionDialog/GameSelectionDialog';
import { UIElement } from '../../models/Preferences';

/**
 *
 * @param preferences the user preferences to filter themes
 * @param getThemeNames function, which returns a list of available themes
 * @param currentTheme the currently selected theme - will be pushed to index 0 if not present
 * @returns the list of shown themes in the UI
 */
export function getValidGames(
  preferences: UIElement[] | null,
  getThemeNames: () => string[],
  currentTheme: CustomTheme
): string[] {
  var themes = getThemeNames();
  if (preferences !== null && preferences.length > 0) {
    // preferences are set -> apply themes where isDisplayed is true
    themes = preferences.filter((p) => p.isDisplayed).map((p) => p.name);
  }
  if (!themes.includes(currentTheme.custom.themeName)) {
    // push theme to index 0
    themes = [currentTheme.custom.themeName, ...themes];
  }
  return themes;
}

export const GameSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const { preferences, preferencesLoaded } = usePreferenceStore();
  const [validGames, setValidGames] = useState<string[]>([]);
  const OVERVIEW_NAME = 'all';
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    var validGames = getValidGames(
      preferences.ui.displayedGames,
      getThemeNames,
      theme
    );
    validGames.push(OVERVIEW_NAME);
    setValidGames(validGames);
  }, [preferences, theme]);

  if (!preferencesLoaded || theme.custom.themeName === 'default') {
    // the displayed games depend on preferences, so we wait until they are loaded
    // which is done in the theme store
    return null;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <DynamicGameGrid
        items={validGames}
        capacity={{ xs: 20, sm: 25, md: 11, lg: 14, xl: 17 }}
        selectedItem={theme.custom.themeName}
        onSelect={async (item) => {
          if (item === OVERVIEW_NAME) {
            setModalOpen(true);
          } else {
            await setTheme(item);
          }
        }}
      ></DynamicGameGrid>
      {modalOpen && (
        <GameSelectionDialog
          state={{ open: modalOpen, setOpen: setModalOpen }}
        />
      )}
    </Box>
  );
};
