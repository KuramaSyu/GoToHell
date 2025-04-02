import { GetSportsResponse } from '../models/Sport';
interface SportsCalculator {
  get(sport: string, game: string, deaths: number): number;
}

/**
 * Implements the SportsCalculator interface to compute a score for a given sport and game.
 *
 * @remarks
 * This calculator uses default multipliers provided via a GetSportsResponse object.
 * It retrieves the base values for a specific game and sport (defaulting to 0 if not available),
 * then calculates the final score by multiplying these base values with the number of deaths,
 * and finally applies rounding using Math.round.
 *
 * @example
 * ```typescript
 * const calculator = new DefaultSportsCalculator(getSportsResponse);
 * const score = calculator.get("soccer", "league", 5);
 * ```
 *
 * @param getSportsResponse - An object containing the default multiplier values for games and sports.
 */
class DefaultSportsCalculator implements SportsCalculator {
  default: GetSportsResponse;
  constructor(getSportsResposne: GetSportsResponse) {
    this.default = getSportsResposne;
  }

  get(sport: string, game: string, deaths: number): number {
    const game_base = this.default.games[game] ?? 0;
    const sport_base = this.default.sports[sport] ?? 0;
    return Math.round(game_base * sport_base * deaths);
  }
}

class BaseSportsCalculatorDecorator implements SportsCalculator {
  decorated: SportsCalculator;
  constructor(decorated: SportsCalculator) {
    this.decorated = decorated;
  }

  get(sport: string, game: string, deaths: number): number {
    return this.decorated.get(sport, game, deaths);
  }
}
