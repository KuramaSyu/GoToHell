import { Multiplier, OverrideSportDefinition } from '../models/Preferences';
import { GetSportsResponse } from '../models/Sport';

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
}

export class DefaultSportsCalculator implements SportsCalculator {
  default: GetSportsResponse;
  constructor(getSportsResposne: GetSportsResponse) {
    this.default = getSportsResposne;
  }

  get(sport: string, game: string): number {
    const game_base = this.default.games[game] ?? 0;
    const sport_base = this.default.sports[sport] ?? 0;
    return game_base * sport_base;
  }

  calculate_amount(sport: string, game: string, deaths: number): number {
    return Math.round(this.get(sport, game) * deaths);
  }
}

export class BaseSportsCalculatorDecorator implements SportsCalculator {
  decorated: SportsCalculator;
  constructor(decorated: SportsCalculator) {
    this.decorated = decorated;
  }

  // Returns the base, which should be multiplied with the death amount
  get(sport: string, game: string): number {
    return this.decorated.get(sport, game);
  }

  // Returns the actuall amount of exercises to do
  calculate_amount(sport: string, game: string, deaths: number): number {
    return Math.round(this.get(sport, game) * deaths);
  }
}

export class MultiplierDecorator extends BaseSportsCalculatorDecorator {
  // TODO: map number to specific game
  multipliers: Multiplier[];
  constructor(decorated: SportsCalculator, multipliers: Multiplier[]) {
    super(decorated);
    this.multipliers = multipliers;
  }
  get(sport: string, game: string): number {
    // find multiplier for the specific game and sport
    var multipliers = this.multipliers.filter(
      (entry) => entry.game == game && entry.sport == sport
    );

    // TODO: check for global game or sport multipliers
    // if multiplier is not found, check for the global multiplier
    multipliers = this.multipliers.filter((entry) => entry.game == 'global');

    if (multipliers.length > 0) {
      // a multiplier was found => apply it
      return this.decorated.get(sport, game) * multipliers[0]!.multiplier;
    }

    // no multiplier was found => return the base amount
    return this.decorated.get(sport, game);
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

  get(sport: string, game: string): number {
    const override =
      this.overrides.filter(
        (entry) => entry.game == game && entry.sport == sport
      )[0] ?? null;

    if (override !== null) {
      return Number(override.amount);
    }

    return this.decorated.get(sport, game);
  }
}

export class ExactlyOneDecorator extends BaseSportsCalculatorDecorator {
  get(sport: string, game: string): number {
    return 1;
  }
}
