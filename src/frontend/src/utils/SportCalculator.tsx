import { ReactNode } from 'react';
import { Multiplier, OverrideSportDefinition } from '../models/Preferences';
import { GetSportsResponse } from '../models/Sport';
import { Box, darken, lighten, Typography } from '@mui/material';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import Hexagon from '../components/Shapes';
import { useThemeStore } from '../zustand/useThemeStore';
import { NUMBER_FONT } from '../statics';
/**
 * A calculator for the amount of exercises of a given sport a user
 * has to do. This is effected by game and amount of deaths.
 *
 * There are several Decorators, to extend the Behaviour of the
 * Calculator, depening on the needs
 */
export interface SportsCalculator {
  get(sport: string, game: string): number;
  calculate_amount(sport: string, game: string, deaths: number): number;
  make_box(sport: string, game: string, deaths: number): ReactNode;
  get_game_base(game: string): number;
  get_sport_base(sport: string): number;
  get_multiplier(sport: string, game: string): Multiplier | null;
}

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
    return game_base * sport_base;
  }

  calculate_amount(sport: string, game: string, deaths: number): number {
    return Math.round(this.get(sport, game) * deaths);
  }
  make_box(sport: string, game: string, deaths: number): ReactNode {
    const theme = useThemeStore.getState().theme;
    const text_color = lighten(theme.palette.muted.main, 0.5);
    const sport_base = this.get_sport_base(sport);
    const game_base = this.get_game_base(game);
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
        <Box
          className="hoverBox"
          sx={{
            position: 'absolute',
            top: '-40px', // adjust as needed
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            whiteSpace: 'nowrap',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            zIndex: 1,
            fontFamily: NUMBER_FONT,
          }}
        >
          Game Base ({this.get_game_base(game)}) x Sport Base (
          {this.get_sport_base(sport)}) = {this.get(sport, game)}
        </Box>

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
            {`$\\frac{\\overbrace{${game_base}\\ \\times \\ ${sport_base}}^{${
              game_base * sport_base
            }}}{death}$`}
          </Latex>
        </Box>
      </Box>
    );
  }
}

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

export class MultiplierDecorator extends BaseSportsCalculatorDecorator {
  multipliers: Multiplier[];

  constructor(decorated: SportsCalculator, multipliers: Multiplier[]) {
    super(decorated);
    this.multipliers = multipliers;
  }

  get_multiplier(sport: string, game: string): Multiplier | null {
    // find multiplier for the specific game and sport
    var multipliers = this.multipliers.filter(
      (entry) => entry.game == game && entry.sport == sport
    );

    // TODO: check for global game or sport multipliers
    // if multiplier is not found, check for the global multiplier
    multipliers = this.multipliers.filter((entry) => entry.game == null);

    if (multipliers[0] !== null && multipliers[0]?.multiplier !== 1) {
      return multipliers[0]!;
    }
    return null;
  }

  get(sport: string, game: string): number {
    const multiplier = this.get_multiplier(sport, game);

    if (multiplier !== null) {
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

    if (override !== null) {
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
          <Box
            className="hoverBox"
            sx={{
              position: 'absolute',
              top: '-40px', // adjust as needed
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              fontSize: 14,
              whiteSpace: 'nowrap',
              opacity: 0,
              visibility: 'hidden',
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
              zIndex: 1,
              fontFamily: NUMBER_FONT,
            }}
          >
            Override for Game {game} and Sport {sport}: {override.amount}
          </Box>

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

// for the make_box, to wrap it with the death amount
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

export class HumanLockDecorator extends BaseSportsCalculatorDecorator {
  calculate_amount(sport: string, game: string, deaths: number): number {
    if (sport == 'plank') {
      return (
        (42 *
          Math.log(
            1 + deaths * (this.get_multiplier(sport, game)?.multiplier ?? 1)
          )) /
        Math.log(1.75)
      );
    }
    return this.decorated.calculate_amount(sport, game, deaths);
  }

  make_box(sport: string, game: string, deaths: number): ReactNode | null {
    if (sport != 'plank') {
      return this.decorated.make_box(sport, game, deaths);
    }
    const theme = useThemeStore.getState().theme;
    const text_color = lighten(theme.palette.muted.main, 0.5);
    const multiplier = this.get_multiplier(sport, game)?.multiplier;
    const multiplier_latex = multiplier
      ? `\\underbrace{\\times\\ ${multiplier}}_{multiplier}`
      : ``;
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
        <Box
          className="hoverBox"
          sx={{
            position: 'absolute',
            top: '-40px', // adjust as needed
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            whiteSpace: 'nowrap',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            zIndex: 1,
            fontFamily: NUMBER_FONT,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box>This weird formula is used, </Box>
          <Box>to flat out the amount of </Box>
          <Box>planks at around 180s</Box>
        </Box>

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
            <Latex>{`$\\underbrace{42\\ \\cdot}_{strength} log_{1.75}{1 + \\overbrace{${deaths}}^{deaths} ${multiplier_latex}}$`}</Latex>
          </Box>
        </Box>
      </Box>
    );
  }
}
