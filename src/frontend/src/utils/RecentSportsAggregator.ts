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

    const canGroupWith = (
      candidate: UserSport | undefined,
      current: UserSport,
      startTime: number,
    ) => {
      if (!candidate) return false;
      const candidateTime = new Date(candidate.timedate).getTime();
      return (
        isOlderThanMin(candidate) &&
        sameUserOrAllowed(candidate, current) &&
        sameKindOrAllowed(candidate, current) &&
        sameGameOrAllowed(candidate, current) &&
        isWithinMaxWindow(candidateTime, startTime)
      );
    };
    const sorted = [...sports].sort(
      (a, b) => new Date(a.timedate).getTime() - new Date(b.timedate).getTime(),
    );
    const grouped: Array<UserSport | UserSportGroup> = [];
    let i = 0;
    while (i < sorted.length) {
      const current = sorted[i];
      if (!current) {
        i++;
        continue;
      }
      if (!isOlderThanMin(current)) {
        grouped.push(current);
        i++;
        continue;
      }
      // Try to group with a sliding window up to maxWindowMs
      let j = i + 1;
      let groupAmount = current.amount;
      let groupCount = 1;
      let startTime = new Date(current.timedate).getTime();
      let endTime = startTime;
      while (j < sorted.length && canGroupWith(sorted[j], current, startTime)) {
        const cand = sorted[j]!;
        groupAmount += cand.amount;
        endTime = new Date(cand.timedate).getTime();
        groupCount++;
        j++;
      }
      if (groupCount > 1) {
        // build entries array from current..j-1
        const entries: UserSport[] = [];
        for (let k = i; k < j; k++) {
          const s = sorted[k];
          if (s) entries.push(s);
        }
        grouped.push({
          entries,
        });
        i = j;
      } else {
        grouped.push(current);
        i++;
      }
    }
    return grouped;
  }
}
