// RecentSportsAggregator.ts
// Aggregates UserSport entries into groups with configurable options.

import {
  UserSport,
  UserSportGroup,
} from '../pages/MainPage/Timeline/models/SportModels';

export interface RecentSportsAggregatorOptions {
  minTimeMs?: number; // Minimum age (ms) for grouping (default: 2h)
  maxWindowMs?: number; // Maximum window (ms) for grouping (default: 12h)
  allowDifferentKinds?: boolean; // Allow grouping different kinds (default: false)
  allowDifferentGames?: boolean; // Allow grouping different games (default: false)
  allowDifferentUsers?: boolean; // Allow grouping different users (default: false)
  maxInterleavingCount?: number; // Max number of intervening entries allowed (default: 5)
  maxInterleavingGapMs?: number; // Max time gap between matched same-user entries (default: 1h)
}

/**
 * Aggregates UserSport entries into groups with configurable options.
 *
 * Usage example:
 *   const aggregator = RecentSportsAggregator.builder()
 *     .withMinTimeMs(2 * 60 * 60 * 1000)
 *     .withMaxWindowMs(12 * 60 * 60 * 1000)
 *     .allowDifferentKinds(false)
 *     .allowDifferentGames(false)
 *     .allowDifferentUsers(false)
 *     .withNow(Date.now());
 *   const result = aggregator.aggregate(sportsArray);
 */
export class RecentSportsAggregator {
  private minTimeMs: number = 2 * 60 * 60 * 1000;
  private maxWindowMs: number = 12 * 60 * 60 * 1000;
  private _allowDifferentKinds = false;
  private _allowDifferentGames = false;
  private _allowDifferentUsers = false;
  private now: number = Date.now();
  private maxInterleavingCount = 5;
  private maxInterleavingGapMs = 60 * 60 * 1000; // 1 hour

  /**
   * Returns a new builder instance for RecentSportsAggregator.
   */
  static builder() {
    return new RecentSportsAggregator();
  }

  /**
   * Sets the minimum age (in ms) for a UserSport to be eligible for grouping.
   * Default: 2 hours.
   * @param ms Minimum time in milliseconds
   * @returns this (for chaining)
   */
  withMinTimeMs(ms: number) {
    this.minTimeMs = ms;
    return this;
  }

  /**
   * Sets the maximum time window (in ms) for grouping UserSport entries.
   * Default: 12 hours.
   * @param ms Maximum window in milliseconds
   * @returns this (for chaining)
   */
  withMaxWindowMs(ms: number) {
    this.maxWindowMs = ms;
    return this;
  }

  /**
   * Allows grouping of different sport kinds if true. Default: false.
   * @param flag Allow grouping different kinds
   * @returns this (for chaining)
   */
  /**
   * Allows grouping entries with different kinds when true.
   * @param flag
   */
  allowDifferentKinds(flag: boolean) {
    this._allowDifferentKinds = flag;
    return this;
  }

  /**
   * Allows grouping of different games if true. Default: false.
   * @param flag Allow grouping different games
   * @returns this (for chaining)
   */
  /**
   * Allows grouping entries with different games when true.
   * @param flag
   */
  allowDifferentGames(flag: boolean) {
    this._allowDifferentGames = flag;
    return this;
  }

  /**
   * Allows grouping of different users if true. Default: false.
   * @param flag Allow grouping different users
   * @returns this (for chaining)
   */
  /**
   * Allows grouping entries with different users when true.
   * @param flag
   */
  allowDifferentUsers(flag: boolean) {
    this._allowDifferentUsers = flag;
    return this;
  }

  /**
   * Sets the maximum number of intervening (non-matching) entries allowed
   * between two matching entries of the same group. Default: 5.
   */
  withMaxInterleavingCount(n: number) {
    this.maxInterleavingCount = n;
    return this;
  }

  /**
   * Sets the maximum allowed time gap (ms) between two matching entries
   * of the same user to still be considered part of the same group.
   * Default: 1 hour.
   */
  withMaxInterleavingGapMs(ms: number) {
    this.maxInterleavingGapMs = ms;
    return this;
  }

  /**
   * Sets the reference time (in ms since epoch) for grouping calculations.
   * Useful for testing or deterministic results.
   * @param now Reference time in ms
   * @returns this (for chaining)
   */
  withNow(now: number) {
    this.now = now;
    return this;
  }

  /**
   * Aggregates the given UserSport array into groups according to the configured options.
   * @param sports Array of UserSport entries
   * @returns Array of UserSport and/or UserSportGroup
   */
  aggregate(sports: UserSport[]): Array<UserSport | UserSportGroup> {
    const isOlderThanMin = (sport: UserSport) => {
      const sportTime = new Date(sport.timedate).getTime();
      return this.now - sportTime > this.minTimeMs;
    };
    // Rule helpers for readability
    const isWithinMaxWindow = (sportTime: number, startTime: number) =>
      sportTime - startTime <= this.maxWindowMs;

    const sameUserOrAllowed = (candidate: UserSport, current: UserSport) =>
      this._allowDifferentUsers || candidate.user_id === current.user_id;

    const sameKindOrAllowed = (candidate: UserSport, current: UserSport) =>
      this._allowDifferentKinds || candidate.kind === current.kind;

    const sameGameOrAllowed = (candidate: UserSport, current: UserSport) =>
      this._allowDifferentGames || candidate.game === current.game;
    const sorted = [...sports].sort(
      (a, b) => new Date(a.timedate).getTime() - new Date(b.timedate).getTime(),
    );

    const grouped: Array<UserSport | UserSportGroup> = [];
    const consumed = new Array(sorted.length).fill(false);

    let i = 0;
    while (i < sorted.length) {
      if (consumed[i]) {
        i++;
        continue;
      }
      const current = sorted[i];
      if (!current) {
        consumed[i] = true;
        i++;
        continue;
      }
      // If entry is too recent to be grouped, leave as-is
      if (!isOlderThanMin(current)) {
        grouped.push(current);
        consumed[i] = true;
        i++;
        continue;
      }

      const startTime = new Date(current.timedate).getTime();
      let lastMatchedTime = startTime;
      const groupIndices: number[] = [i];
      consumed[i] = true;

      // scan forward, allowing up to maxInterleavingCount intervening entries
      // and ensuring matched same-user entries are within maxInterleavingGapMs
      let intervening = 0;
      for (let k = i + 1; k < sorted.length; k++) {
        const cand = sorted[k];
        if (!cand) {
          intervening++;
          if (intervening > this.maxInterleavingCount) break;
          continue;
        }
        const candTime = new Date(cand.timedate).getTime();
        if (!isWithinMaxWindow(candTime, startTime)) break;

        if (!isOlderThanMin(cand)) {
          // too new to include, but counts as intervening
          intervening++;
          if (intervening > this.maxInterleavingCount) break;
          continue;
        }

        const kindOk = sameKindOrAllowed(cand, current);
        const gameOk = sameGameOrAllowed(cand, current);

        if (cand.user_id === current.user_id && kindOk && gameOk) {
          const gap = candTime - lastMatchedTime;
          if (
            gap <= this.maxInterleavingGapMs &&
            intervening <= this.maxInterleavingCount
          ) {
            groupIndices.push(k);
            consumed[k] = true;
            lastMatchedTime = candTime;
            intervening = 0;
            continue;
          }
          break;
        }

        // Different user or different kind/game: counts as intervening
        intervening++;
        if (intervening > this.maxInterleavingCount) break;
      }

      if (groupIndices.length > 1) {
        const entries: UserSport[] = groupIndices.map((idx) => sorted[idx]!);
        grouped.push({ entries });
      } else {
        // single entry (no grouping)
        grouped.push(current);
      }

      i++;
    }

    return grouped;
  }
}
