import { OverrideSportDefinition } from '../models/Preferences';
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
  multiplier: number;
  constructor(decorated: SportsCalculator, multiplier: number) {
    super(decorated);
    this.multiplier = multiplier;
  }
  get(sport: string, game: string): number {
    return this.decorated.get(sport, game) * this.multiplier;
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
