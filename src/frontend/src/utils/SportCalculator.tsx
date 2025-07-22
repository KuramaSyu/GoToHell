import { ReactNode } from 'react';
import {
  Multiplier,
  OverrideSportDefinition,
  UserPreferences,
} from '../models/Preferences';
import { GetSportsResponse } from '../models/Sport';
import { Box, darken, lighten, Typography } from '@mui/material';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import Hexagon from '../components/Shapes';
import { useThemeStore } from '../zustand/useThemeStore';
import { NUMBER_FONT } from '../statics';
import usePreferenceStore from '../zustand/PreferenceStore';
import { useUsedMultiplierStore } from '../zustand/usedMultiplierStore';
import { isNumeric } from './UserNumber';
import { ToolTip } from '../components/ToolTip';
/**
 * A calculator for the amount of exercises of a given sport a user
 * has to do. This is effected by game and amount of deaths.
 *
 * There are several Decorators, to extend the Behaviour of the
 * Calculator, depening on the needs
 */
export interface SportsCalculator {
  /**
   * Returns the base value for a given sport and game combination.
   * This value is typically used as the multiplier for calculating exercises.
   *
   * @param sport - The name of the sport.
   * @param game - The name of the game.
   * @returns The base value for the sport and game.
   */
  get(sport: string, game: string): number;

  /**
   * Calculates the total amount of exercises required, factoring in sport, game,
   * and the number of user deaths.
   *
   * @param sport - The name of the sport.
   * @param game - The name of the game.
   * @param deaths - The number of deaths to multiply the base value by.
   * @returns The calculated amount of exercises.
   */
  calculate_amount(sport: string, game: string, deaths: number): number;

  /**
   * Generates a ReactNode containing a LaTeX box that visually represents the calculation
   * performed by `calculate_amount()`.
   *
   * @param sport - The name of the sport.
   * @param game - The name of the game.
   * @param deaths - The number of deaths.
   * @returns A ReactNode with the LaTeX representation of the calculation.
   */
  make_box(sport: string, game: string, deaths: number): ReactNode;

  /**
   * Gets the base value associated with a specific game.
   *
   * @param game - The name of the game.
   * @returns The base value for the game.
   */
  get_game_base(game: string): number;

  /**
   * Gets the base value associated with a specific sport.
   *
   * @param sport - The name of the sport.
   * @returns The base value for the sport.
   */
  get_sport_base(sport: string): number;

  /**
   * Retrieves the multiplier for a given sport and game combination, if any.
   *
   * @param sport - The name of the sport.
   * @param game - The name of the game.
   * @returns The multiplier object or null if none is set.
   */
  get_multiplier(sport: string, game: string): Multiplier | null;
}

/**
 * Default implementation, which implements the most basic calculation method
 */
export class DefaultSportsCalculator implements SportsCalculator {
  default: GetSportsResponse;
  constructor(getSportsResposne: GetSportsResponse) {
    this.default = getSportsResposne;
  }

  get_multiplier(sport: string, game: string): Multiplier | null {
    return null;
  }

  get_game_base(game: string): number {
    return this.default.games[game] ?? 0;
  }

  get_sport_base(sport: string): number {
    return this.default.sports[sport] ?? 0;
  }

  get(sport: string, game: string): number {
    const game_base = this.get_game_base(game);
    const sport_base = this.get_sport_base(sport);
    const product = game_base * sport_base;

    // Round to 2 decimal places to avoid floating point inaccuracies
    return parseFloat(product.toFixed(5));
  }

  calculate_amount(sport: string, game: string, deaths: number): number {
    return Math.round(this.get(sport, game) * deaths);
  }
  make_box(sport: string, game: string, deaths: number): ReactNode {
    const theme = useThemeStore.getState().theme;
    const text_color = lighten(theme.palette.muted.main, 0.5);
    const sport_base = this.get_sport_base(sport);
    const game_base = this.get_game_base(game);
    const sport_times_game_base = this.get(sport, game);
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
          '&:hover .hoverBox': {
            opacity: 1,
            visibility: 'visible',
          },
        }}
      >
        {/* Tooltip Box */}
        <ToolTip>
          Game Base ({game_base}) x Sport Base ({sport_base}) ={' '}
          {sport_times_game_base}
        </ToolTip>

        {/* Main Box */}
        <Box
          sx={{
            backgroundColor: darken(theme.palette.muted.dark, 0),
            px: 5,
            py: 1,
            borderRadius: 8,
            borderColor: lighten(theme.palette.muted.dark, 1 / 5),
            borderWidth: 1,
            fontSize: 24,
            fontFamily: NUMBER_FONT,
            color: text_color,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'inline-flex',
            flex: '0 1 auto',
            flexShrink: 0,
          }}
        >
          <Latex>
            {`$\\frac{\\overbrace{${game_base}\\ \\times \\ ${sport_base}}^{${sport_times_game_base}}}{death}$`}
          </Latex>
        </Box>
      </Box>
    );
  }
}

export class PreferenceRespectingDefaultSportsCalculator extends DefaultSportsCalculator {
  preferences: UserPreferences;

  constructor(
    getSportsResposne: GetSportsResponse,
    preferences: UserPreferences
  ) {
    super(getSportsResposne);
    this.preferences = preferences;
  }

  /**
   * Since there are multipliers which only affect a sport and not any game (game = null), these
   * multipliers will be treatet as SportBase replacement
   * @param sport
   * @returns the preferred SportBase or the default SportBase
   */
  get_sport_base(sport: string): number {
    return (
      this.preferences.multipliers.filter(
        (m) => m.sport === sport && m.game === null
      )[0]?.multiplier ?? super.get_sport_base(sport)
    );
  }
}

/**
 * Base Decorator, which does more or less the same as the DefaultSportsCalculator
 */
export class BaseSportsCalculatorDecorator implements SportsCalculator {
  decorated: SportsCalculator;
  constructor(decorated: SportsCalculator) {
    this.decorated = decorated;
  }

  get_multiplier(sport: string, game: string): Multiplier | null {
    return this.decorated.get_multiplier(sport, game);
  }

  get_game_base(game: string): number {
    return this.decorated.get_game_base(game);
  }

  get_sport_base(sport: string): number {
    return this.decorated.get_sport_base(sport);
  }

  // Returns the base, which should be multiplied with the death amount
  get(sport: string, game: string): number {
    return this.decorated.get(sport, game);
  }

  // Returns the actuall amount of exercises to do
  calculate_amount(sport: string, game: string, deaths: number): number {
    return Math.round(this.get(sport, game) * deaths);
  }

  make_box(sport: string, game: string, deaths: number): ReactNode | null {
    return this.decorated.make_box(sport, game, deaths);
  }
}

/**
 * Adds a custom set multiplier to Latex and calculation
 */
export class MultiplierDecorator extends BaseSportsCalculatorDecorator {
  multipliers: Multiplier[];

  constructor(decorated: SportsCalculator, multipliers: Multiplier[]) {
    super(decorated);
    this.multipliers = multipliers;
  }

  /**
   * Depending on the usedMultiplierStore, either the
   * game specific multiplier or global multiplier will be returned
   *
   * @param sport the currently selected sport
   * @param game the currently selected game
   * @returns the multiplier.
   */
  get_multiplier(sport: string, game: string): Multiplier | null {
    var multipliers: Multiplier[] = [];
    // CURRENTLY NOT IN USE! -- find multiplier for the specific game and sport
    // var multipliers = this.multipliers.filter(
    //   (entry) => entry.game == game && entry.sport == sport
    // );

    const getGlobalMultipliers = () =>
      this.multipliers.filter(
        (entry) => entry.game === null && entry.sport === null
      );
    const getGameSpecificMultipliers = () =>
      (multipliers = this.multipliers.filter((entry) => entry.game == game));

    // TODO: check for global sport multiplier

    const usedMultiplier = useUsedMultiplierStore.getState().usedMultiplier;

    if (usedMultiplier === null) {
      // global multiplier
      multipliers = getGlobalMultipliers();
    } else if (usedMultiplier === undefined) {
      // game specific multiplier or global multiplier in this order
      multipliers = getGameSpecificMultipliers();
      if (multipliers.length === 0) {
        multipliers = getGlobalMultipliers();
      }
    } else {
      // return game specific multiplier
      multipliers = getGameSpecificMultipliers();
    }

    if (multipliers[0] !== null && multipliers[0]?.multiplier !== 1) {
      // return the first found multiplier, if it's not 1
      return multipliers[0]!;
    }
    return null;
  }

  get(sport: string, game: string): number {
    const multiplier = this.get_multiplier(sport, game);

    if (multiplier != null) {
      // a multiplier was found => apply it
      return this.decorated.get(sport, game) * multiplier.multiplier;
    }

    // no multiplier was found => return the base amount
    return this.decorated.get(sport, game);
  }

  make_box(sport: string, game: string, deaths: number): ReactNode | null {
    const theme = useThemeStore.getState().theme;
    const multiplier = this.get_multiplier(sport, game);

    if (multiplier != null && multiplier?.multiplier != 1) {
      return (
        <Box
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          {this.decorated.make_box(sport, game, deaths)}
          <Box sx={{ display: 'flex' }}>
            <Hexagon color={theme.palette.muted.dark}>
              <Box
                sx={{
                  fontSize: 42,
                  color: lighten(theme.palette.muted.dark, 0.5),
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontFamily: NUMBER_FONT,
                }}
              >
                x{multiplier.multiplier}
              </Box>
            </Hexagon>
          </Box>
        </Box>
      );
    }

    return this.decorated.make_box(sport, game, deaths);
  }
}

/**
 * If a overridden game + sport was add, then this Decorator will override the calculation,
 * replaceing base game * base sport with the overridden amount
 */
export class OverrideSportDecorator extends BaseSportsCalculatorDecorator {
  overrides: OverrideSportDefinition[];
  constructor(
    decorated: SportsCalculator,
    overrides: OverrideSportDefinition[]
  ) {
    super(decorated);
    this.overrides = overrides;
  }

  get_override(sport: string, game: string): OverrideSportDefinition | null {
    // search for a specific override for the game and sport
    const override =
      this.overrides.filter(
        (entry) => entry.game == game && entry.sport == sport
      )[0] ?? null;

    return override;
  }

  get(sport: string, game: string): number {
    const override = this.get_override(sport, game);

    if (override != null) {
      // apply the override
      return Number(override.amount);
    }

    // return default
    return this.decorated.get(sport, game);
  }

  make_box(sport: string, game: string, deaths: number): ReactNode {
    const override = this.get_override(sport, game);
    const theme = useThemeStore.getState().theme;
    const text_color = lighten(theme.palette.muted.main, 0.5);

    if (override !== null) {
      return (
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            '&:hover .hoverBox': {
              opacity: 1,
              visibility: 'visible',
            },
          }}
        >
          {/* Tooltip Box */}
          <ToolTip>
            Override for Game {game} and Sport {sport}: {override.amount}
          </ToolTip>

          {/* Main Box */}
          <Box
            sx={{
              backgroundColor: darken(theme.palette.muted.dark, 0),
              px: 5,
              py: 1,
              borderRadius: 8,
              borderColor: lighten(theme.palette.muted.dark, 1 / 5),
              borderWidth: 1,
              fontSize: 22,
              fontFamily: NUMBER_FONT,
              color: text_color,
              justifyContent: 'center',
              alignItems: 'center',
              display: 'inline-flex',
              flex: '0 1 auto',
              flexShrink: 0,
            }}
          >
            <Latex>{`$\\frac{${override.amount}}{death}$`}</Latex>
          </Box>
        </Box>
      );
    }

    return this.decorated.make_box(sport, game, deaths);
  }
}

// for theme custom, where always exactly one exercise is wanted
export class ExactlyOneDecorator extends BaseSportsCalculatorDecorator {
  get(sport: string, game: string): number {
    return 1;
  }

  make_box(sport: string, game: string, deaths: number): ReactNode {
    return null;
  }
}

/**
 * for the make_box, to wrap it with the death amount
 * */
export class DeathDecorator extends BaseSportsCalculatorDecorator {
  make_box(sport: string, game: string, deaths: number): ReactNode {
    const theme = useThemeStore.getState().theme;
    const text_color = lighten(theme.palette.muted.main, 0.5);
    return (
      <Box
        sx={{
          fontSize: 18,
          fontWeight: '100',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          justifyContent: 'center', // center whole box vertically
        }}
      >
        {this.decorated.make_box(sport, game, deaths)}{' '}
        <Box
          sx={{
            backgroundColor: darken(theme.palette.muted.dark, 0),
            px: 1,
            py: 1.5, // Add padding for better fit
            borderRadius: 8,
            borderColor: lighten(theme.palette.muted.dark, 1 / 5),
            borderWidth: 1,
            fontSize: 18,
            fontFamily: NUMBER_FONT,
            color: text_color,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'inline-flex',
            flex: '0 1 auto',
            flexShrink: 0,
          }}
        >
          x {deaths} deaths
        </Box>
      </Box>
    );
  }
}

export const wrapWithColor = (content: string, color: string): string => {
  return `\\textcolor{${color}}{${content}}`;
};

/**
 * Decorator for the plank, which uses a custom formula to calculate the amount of planks
 */
export class HumanLockDecorator extends BaseSportsCalculatorDecorator {
  get_max_seconds_from_preferences(): number {
    const preferences = usePreferenceStore.getState().preferences;
    const max_seconds = preferences.sport_specific.plank.seconds ?? 180;
    return max_seconds;
  }

  strength_factor(deaths: number, game: string, sport: string): number {
    const max_seconds = this.get_max_seconds_from_preferences();
    // initially, asume, 10 deaths are maximum
    return max_seconds / this.log_formula(10, game, sport, 1, 1);
  }

  log_formula(
    deaths: number,
    game: string,
    sport: string,
    game_base: number | null,
    multiplier: number | null
  ): number {
    game_base = game_base ?? this.get_game_base(game);
    multiplier =
      multiplier ?? this.get_multiplier(sport, game)?.multiplier ?? 1;
    let result = Math.log(1 + deaths * multiplier * game_base) / Math.log(1.75);
    if (Number.isNaN(result)) {
      return 0;
    }
    return result;
  }
  calculate_amount(sport: string, game: string, deaths: number): number {
    const safeDeaths =
      typeof deaths === 'number' && !isNaN(deaths) ? deaths : 0;
    if (sport == 'plank') {
      return Math.round(
        this.strength_factor(safeDeaths, game, sport) *
          this.log_formula(safeDeaths, game, sport, null, null)
      );
    }
    return this.decorated.calculate_amount(sport, game, safeDeaths);
  }

  make_box(sport: string, game: string, deaths: number): ReactNode | null {
    if (sport != 'plank') {
      return this.decorated.make_box(sport, game, deaths);
    }
    const theme = useThemeStore.getState().theme;
    const text_color = lighten(theme.palette.muted.main, 0.5);
    const multiplier = this.get_multiplier(sport, game)?.multiplier;
    const strength_factor = this.strength_factor(deaths, game, sport);
    const multiplier_latex = multiplier
      ? `\\overbrace{\\times\\ ${multiplier}}^{multiplier}`
      : ``;
    const game_base_latex = `\\underbrace{\\times \\ ${this.get_game_base(
      game
    )}}_{game base}`;
    return (
      <Box
        sx={{
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          '&:hover .hoverBox': {
            opacity: 1,
            visibility: 'visible',
          },
        }}
      >
        {/* Tooltip Box */}
        <ToolTip>
          <Box>With 10 Deaths, and a game base of 1, </Box>
          <Box>
            you have to do {this.get_max_seconds_from_preferences()}s plank
          </Box>
        </ToolTip>

        {/* Main Box */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              backgroundColor: darken(theme.palette.muted.dark, 0),
              px: 1,
              py: 1,
              borderRadius: 8,
              borderColor: lighten(theme.palette.muted.dark, 1 / 5),
              borderWidth: 1,
              fontSize: 20,
              fontFamily: NUMBER_FONT,
              color: text_color,
              justifyContent: 'center',
              alignItems: 'center',
              display: 'inline-flex',
              flex: '0 1 auto',
              flexShrink: 0,
            }}
          >
            <Latex>{`$\\underbrace{${strength_factor.toFixed(
              1
            )}\\ \\cdot}_{strength} log_{\\frac{7}{4}}{1 \\overbrace{+${deaths}}^{deaths} ${game_base_latex} ${multiplier_latex}}$`}</Latex>
          </Box>
        </Box>
      </Box>
    );
  }
}
