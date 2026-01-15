import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Box,
  Typography,
  ButtonGroup,
  alpha,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  SvgIcon,
} from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useSportStore } from '../../useSportStore';
import { GetSportsResponse } from '../../models/Sport';

import {
  DeathDecorator,
  DefaultSportsCalculator,
  ExactlyOneDecorator,
  HumanLockDecorator,
  MultiplierDecorator,
  OverrideSportDecorator,
  PreferenceRespectingDefaultSportsCalculator,
  SportsCalculator,
} from '../../utils/SportCalculator';

import useCalculatorStore from '../../zustand/CalculatorStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { useUsedMultiplierStore } from '../../zustand/usedMultiplierStore';
import { Multiplier, UserPreferences } from '../../models/Preferences';
import { animated, useSpring, useTransition } from 'react-spring';
import useInfoStore from '../../zustand/InfoStore';
import { GameSelectionMap, sportIconMap } from '../../utils/data/Sports';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { SportDialog } from './RecentSports/SportDialog';
import { SportSelectionDialog } from './Dialogs/SelectionDialog/SportSelectionDialog';
import { set } from 'date-fns';
import AppsIcon from '@mui/icons-material/Apps';
import { CustomTheme } from '../../theme/customTheme';
import { get } from 'http';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';

const AnimatedToggleButton = animated(ToggleButton);

const getImageProps = (isSelected: boolean, theme: CustomTheme) => {
  return {
    width: 50,
    height: 50,
    fill: isSelected
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    color: isSelected
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    // filter: isSelected
    //   ? 'brightness(0) invert(1)'
    //   : theme.palette.mode === 'dark'
    //   ? 'brightness(0) invert(0.8)'
    //   : 'none',
  };
};

/**
 * builds up the Decorator Stack, which is used to calculate the amount of exercies
 * and display it's latex.
 *
 * The Decorator Stack contains:
 *  - `DefaultCalculator` for backend defaults
 *  - `OverrideSportDecorator` for custom Sport overrides
 *  - `DeathDecorator` to include deaths in LaTeX calculation
 *  - `MultiplierDecorator` to include Multiplier Settings
 *  - `HumanLockDecorator` for custom Plank formula
 *  - `ExactlyOneDecorator` (only when game is custom) to set all previous values to 1
 */
export const buildDecoratorStack = (
  sportResponse: GetSportsResponse,
  preferences: UserPreferences,
  themeName: string
): SportsCalculator => {
  const BASE_SETTINGS = sportResponse;

  // base for calculating default values with respecting the users overrides
  var base: SportsCalculator = new PreferenceRespectingDefaultSportsCalculator(
    BASE_SETTINGS,
    preferences
  );

  // custom per game per sport overrides
  base = new OverrideSportDecorator(base, preferences.game_overrides);

  // add DeathDecorator, to wrap the output with the death amount
  base = new DeathDecorator(base);

  // custom multipliers, either global or per game and sport
  base = new MultiplierDecorator(base, preferences.multipliers);

  // custom decorator for planks
  base = new HumanLockDecorator(base);

  // check if game: custom is selected
  if (themeName == 'custom') {
    // add ExactlyOneDecorator, to always return 1
    base = new ExactlyOneDecorator(base);
  }

  return base;
};

// Select the sport kind with a button
export const SportSelector = () => {
  const { theme } = useThemeStore();
  const { currentSport, setSport } = useSportStore();
  const { sportResponse, getSportMultiplier } = useSportResponseStore();
  const { setCalculator } = useCalculatorStore();
  const { preferences, preferencesLoaded } = usePreferenceStore();
  const { usedMultiplier } = useUsedMultiplierStore();
  const { setMessage: setErrorMessage } = useInfoStore();
  const { isMobile } = useBreakpoint();
  const [dialogOpen, setDialogOpen] = useState(false);

  const displayedSports = useMemo((): Multiplier[] => {
    if (sportResponse?.sports === undefined) {
      return [];
    }

    const sports = sportResponse!.sports!;
    const defaultSportKeys = Object.keys(sports);

    // Get the list of sports the user has explicitly chosen to display.
    const preferredSportNames =
      preferences.ui.displayedSports
        ?.filter((s) => s.isDisplayed)
        .map((s) => s.name) ?? defaultSportKeys;

    // Build the list of multipliers for the preferred sports.
    let sportPerferences = preferredSportNames.map((sport) => {
      return getSportMultiplier(sport);
    });

    if (
      currentSport.sport !== null &&
      !sportPerferences.find((s) => s.sport === currentSport.sport)
    ) {
      // The currently selected sport is not in the preferred list (e.g., selected from a dialog).
      // Prepend it to the list so it's visible.
      const multiplier: Multiplier = {
        game: null,
        multiplier: currentSport?.sport_multiplier ?? 1,
        sport: currentSport?.sport,
      };
      sportPerferences = [multiplier, ...sportPerferences];
    }

    // add a "show all" option at the end
    sportPerferences.push({
      game: null,
      multiplier: 1,
      sport: 'show_all',
    });

    return sportPerferences;
  }, [preferences, sportResponse, currentSport]);

  // transition for button elements in button group
  const transitions = useTransition(preferencesLoaded ? displayedSports : [], {
    from: { opacity: 0, transform: 'scale(0.7) translateY(-20px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: {
      opacity: 0,
      transform: 'scale(0.7) translateY(20px)',
      position: 'absolute',
    },
    keys: (item) => item.sport ?? 'none', // Use a unique key for each item
    config: { tension: 220, friction: 12 },
    trail: 120, // Optional: add a small delay between each item's animation
  });

  /**
   * updates the DecoratorStack, when:
   *  - game changs
   *  - selected sport changes
   *  - sport response from backend changes
   *  - preferences changes
   *  - usedMultiplier changes
   */
  useEffect(() => {
    setCalculator(
      buildDecoratorStack(sportResponse, preferences, theme.custom.themeName)
    );
  }, [theme, currentSport, sportResponse, preferences, usedMultiplier]);

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

  // on mount: set random sport as current sport (only displayed sports)
  useEffect(() => {
    new ApiRequirementsBuilder()
      .add(ApiRequirement.Preferences)
      .fetchIfNeeded()
      .then(() => {
        // get random sport from preferences
        const preferredSports = preferences.ui.displayedSports?.filter(
          (s) => s.isDisplayed && s.name !== 'show_all'
        );
        if (preferredSports != null && preferredSports.length > 0) {
          const randomSport =
            preferredSports[Math.floor(Math.random() * preferredSports.length)];

          if (randomSport == null) return;
          // Then use randomSport to set the sport
          const multiplier = getSportMultiplier(randomSport.name);
          setSport({
            ...currentSport,
            sport: randomSport.name,
            sport_multiplier: multiplier.multiplier,
          });
        }
      });
  }, []);

  /**
   * Handles button clicks for sport selection.
   *
   * @param sport the selected sport
   * @param multiplier the multiplier for the sport
   */
  const onButtonClick = (sport: string | null, multiplier: number) => {
    if (sport === 'show_all') {
      setDialogOpen(true);
    } else {
      setSport({
        ...currentSport,
        sport: sport,
        sport_multiplier: multiplier,
      });
    }
  };

  if (
    sportResponse === null ||
    !preferencesLoaded ||
    theme.custom.themeName === 'default'
  ) {
    // the displayed sports depend on preferences, so we wait until they are loaded
    return <Box />;
  }

  if (isMobile) {
    // return only a grid with 5 per row, with only icons
    const items_per_row = displayedSports.length > 6 ? 4 : 3;
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${items_per_row}, 1fr)`,
          gap: 2,
          padding: 2,
        }}
      >
        {displayedSports.map(({ sport, multiplier }) => {
          const isSelected = sport === currentSport?.sport;

          return (
            <Button
              onClick={() => onButtonClick(sport, multiplier)}
              variant={sport === currentSport?.sport ? 'contained' : 'outlined'}
              key={sport}
              sx={{
                backgroundColor: isSelected
                  ? null
                  : alpha(theme.palette.muted.dark, 0.2),
                borderRadius: 3,
                borderWidth: 3,
                textShadow: isSelected
                  ? null
                  : `2px 2px 2px ${theme.palette.muted.dark}`,
              }}
            >
              {sport !== 'show_all' ? (
                <SvgIcon
                  component={sportIconMap[String(sport)]!}
                  sx={{
                    color: isSelected
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                    height: 42,
                    width: 42,
                  }}
                  inheritViewBox
                />
              ) : (
                <AppsIcon sx={getImageProps(isSelected, theme)} />
              )}
            </Button>
          );
        })}
        {dialogOpen && (
          <SportSelectionDialog
            state={{ open: dialogOpen, setOpen: setDialogOpen }}
          />
        )}
      </Box>
    );
  }
  return (
    <Box width="clamp(40px, 100%, 350px)">
      {/* Vertical ButtonGroup for sports selection */}
      <ToggleButtonGroup
        orientation="vertical"
        fullWidth
        exclusive
        value={currentSport?.sport}
        //color="primary"
      >
        {transitions((style, { sport, multiplier }) => {
          const isSelected = sport === currentSport?.sport;

          return (
            <AnimatedToggleButton
              style={style}
              onClick={() => onButtonClick(sport, multiplier)}
              value={sport ?? ''}
              key={sport}
              sx={{
                gap: 3,
                color: theme.palette.text.primary,
                backgroundColor: 'transparent',
                // Add selected state styling
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
                // Optional: add hover state for non-selected buttons
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            >
              {sport !== 'show_all' ? (
                sportIconMap[String(sport)] ? (
                  <SvgIcon
                    component={sportIconMap[String(sport)]!}
                    sx={{
                      color: isSelected
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                      height: 42,
                      width: 42,
                    }}
                    inheritViewBox
                  />
                ) : null
              ) : (
                <AppsIcon sx={getImageProps(isSelected, theme)} />
              )}
              <Typography>{String(sport).replace('_', ' ')}</Typography>
            </AnimatedToggleButton>
          );
        })}
      </ToggleButtonGroup>
      {dialogOpen && (
        <SportSelectionDialog
          state={{ open: dialogOpen, setOpen: setDialogOpen }}
        />
      )}
    </Box>
  );
};
