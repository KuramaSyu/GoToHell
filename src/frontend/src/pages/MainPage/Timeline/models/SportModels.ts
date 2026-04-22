/**
 * Represents a single sport record as returned by the backend.
 *
 * Fields:
 * - `id`: unique numeric id of the record
 * - `kind`: type/name of the sport (e.g. "running", "push_up")
 * - `amount`: numeric amount associated with the sport (e.g. reps, score)
 * - `timedate`: ISO datetime string when the sport was recorded
 * - `user_id`: id of the user who recorded the sport
 * - `game`: optional game/context identifier
 */
export interface UserSport {
  id: number;
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
}

/**
 * A grouped set of `UserSport` entries. Used to aggregate nearby/related
 * records into a single timeline item to avoid spamming the timeline.
 */
export interface UserSportGroup {
  entries: UserSport[];
}

/**
 * Helper model that wraps a `UserSportGroup` and provides convenience accessors
 * for derived values such as start/end time, distinct kinds/games/users,
 * total amount and entry count.
 */
export class UserSportGroupModel {
  constructor(public entries: UserSport[]) {}

  /**
   * ISO datetime string of the first entry in the group (or empty string).
   */
  startTime(): string {
    if (this.entries.length === 0) return '';
    return this.entries[0]?.timedate ?? '';
  }

  /**
   * ISO datetime string of the last entry in the group (or empty string).
   */
  endTime(): string {
    if (this.entries.length === 0) return '';
    return this.entries[this.entries.length - 1]?.timedate ?? '';
  }

  /**
   * Return an array of distinct kinds present in the group.
   */
  kinds(): string[] {
    return Array.from(new Set(this.entries.map((e) => e.kind)));
  }

  /**
   * Return an array of distinct games present in the group.
   */
  games(): string[] {
    return Array.from(new Set(this.entries.map((e) => e.game)));
  }

  /**
   * Return an array of distinct user ids referenced by the group.
   */
  users(): string[] {
    return Array.from(new Set(this.entries.map((e) => e.user_id)));
  }

  /**
   * Number of entries in the group.
   */
  count(): number {
    return this.entries.length;
  }

  /**
   * Sum of the `amount` field across all entries in the group.
   */
  amount(): number {
    return this.entries.reduce((s, e) => s + e.amount, 0);
  }
}
