import { describe, it, expect } from 'vitest';
import { RecentSportsAggregator } from './RecentSportsAggregator';
import { UserSportGroupModel } from '../pages/MainPage/Timeline/models/SportModels';

interface UserSport {
  id: number;
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
}

interface UserSportGroup {
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
  count: number;
  start_timedate: string;
  end_timedate: string;
}

describe('RecentSportsAggregator', () => {
  const now = new Date('2026-04-22T12:00:00.000Z').getTime();
  const base: UserSport = {
    id: 1,
    kind: 'run',
    amount: 1,
    timedate: '2026-04-22T00:00:00.000Z',
    user_id: 'u1',
    game: 'g1',
  };

  it('returns empty for empty input', () => {
    expect(
      RecentSportsAggregator.builder()
        .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
        .withNow(now)
        .aggregate([]),
    ).toEqual([]);
  });

  it('does not group entries newer than minTime', () => {
    const sport: UserSport = {
      ...base,
      timedate: '2026-04-22T11:00:01.000Z',
      id: 2,
    };
    expect(
      RecentSportsAggregator.builder()
        .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
        .withNow(now)
        .aggregate([sport]),
    ).toEqual([sport]);
  });

  it('groups two entries older than minTime, same user/kind/game, within maxWindow', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      timedate: '2026-04-22T08:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(result.length).toBe(1);
    const groupModel = new UserSportGroupModel((result[0] as any).entries);
    expect(groupModel.count()).toBe(2);
    expect(groupModel.amount()).toBe(2);
    expect(groupModel.startTime()).toBe(s1.timedate);
    expect(groupModel.endTime()).toBe(s2.timedate);
  });

  it('does not group if different user unless allowed', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u2',
      timedate: '2026-04-22T08:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(result.length).toBe(2);
    const allowed = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .allowDifferentUsers(true)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(allowed.length).toBe(1);
    // verify via model
    expect(new UserSportGroupModel((allowed[0] as any).entries).count()).toBe(
      2,
    );
  });

  it('does not group if different kind unless allowed', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      kind: 'run',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      kind: 'walk',
      timedate: '2026-04-22T08:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(result.length).toBe(2);
    const allowed = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .allowDifferentKinds(true)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(allowed.length).toBe(1);
    expect(new UserSportGroupModel((allowed[0] as any).entries).count()).toBe(
      2,
    );
  });

  it('does not group if different game unless allowed', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      game: 'g2',
      timedate: '2026-04-22T08:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(result.length).toBe(2);
    const allowed = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .allowDifferentGames(true)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(allowed.length).toBe(1);
    expect(new UserSportGroupModel((allowed[0] as any).entries).count()).toBe(
      2,
    );
  });

  it('does not group if time window > maxWindow', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      timedate: '2026-04-21T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      timedate: '2026-04-22T00:01:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .withNow(now)
      .aggregate([s1, s2]);
    expect(result.length).toBe(2);
  });

  it('groups only entries older than minTime, leaves newer ones ungrouped', () => {
    const old1: UserSport = {
      ...base,
      id: 2,
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const old2: UserSport = {
      ...base,
      id: 3,
      timedate: '2026-04-22T03:00:00.000Z',
    };
    const new1: UserSport = {
      ...base,
      id: 4,
      timedate: '2026-04-22T11:00:01.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .withMaxInterleavingGapMs(12 * 60 * 60 * 1000)
      .withNow(now)
      .aggregate([old1, old2, new1]);
    expect(result.some((e) => (e as UserSport).id === 4)).toBe(true);
    expect(
      result.some(
        (e) =>
          (e as any).entries &&
          new UserSportGroupModel((e as any).entries).count() === 2,
      ),
    ).toBe(true);
  });

  it('respects custom minTime and maxWindow', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      timedate: '2026-04-22T10:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      timedate: '2026-04-22T10:30:00.000Z',
    };
    // Default minTime is 2h, so these would not be grouped
    const def = RecentSportsAggregator.builder()
      .withNow(now)
      .aggregate([s1, s2]);
    expect(def.length).toBe(2);
    // Custom minTime 1h, maxWindow 2h
    const custom = RecentSportsAggregator.builder()
      .withMinTimeMs(60 * 60 * 1000)
      .withMaxWindowMs(2 * 60 * 60 * 1000)
      .withNow(now)
      .aggregate([s1, s2]);
    expect(custom.length).toBe(1);
    expect(new UserSportGroupModel((custom[0] as any).entries).count()).toBe(2);
  });

  it('groups with all allow* options enabled (users, kinds, games)', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u2',
      kind: 'walk',
      game: 'g2',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u3',
      kind: 'jump',
      game: 'g3',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentUsers(true)
      .allowDifferentKinds(true)
      .allowDifferentGames(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(1);
    expect(new UserSportGroupModel((result[0] as any).entries).count()).toBe(3);
  });

  it('groups only by user if allowUsers, not kind/game', () => {
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u1',
      kind: 'walk',
      game: 'g2',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u1',
      kind: 'jump',
      game: 'g3',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentUsers(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(3); // kinds/games not allowed, so no grouping
  });

  it('groups only by kind if allowKinds, not user/game', () => {
    // same user and game, different kinds -> allowKinds should permit grouping
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u1',
      kind: 'walk',
      game: 'g1',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u1',
      kind: 'jump',
      game: 'g1',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentKinds(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(1);
    expect(new UserSportGroupModel((result[0] as any).entries).count()).toBe(3);
  });

  it('groups only by game if allowGames, not user/kind', () => {
    // same user and kind, different games -> allowGames should permit grouping
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u1',
      kind: 'run',
      game: 'g2',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u1',
      kind: 'run',
      game: 'g3',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentGames(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(1);
    expect(new UserSportGroupModel((result[0] as any).entries).count()).toBe(3);
  });

  it('groups by user and kind if both allowed, not game', () => {
    // same game, different users and kinds -> allowUsers+allowKinds should permit grouping
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u2',
      kind: 'walk',
      game: 'g1',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u3',
      kind: 'jump',
      game: 'g1',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentUsers(true)
      .allowDifferentKinds(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(1);
    expect(new UserSportGroupModel((result[0] as any).entries).count()).toBe(3);
  });

  it('groups by user and game if both allowed, not kind', () => {
    // same kind, different users and games -> allowUsers+allowGames should permit grouping
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u2',
      kind: 'run',
      game: 'g2',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u3',
      kind: 'run',
      game: 'g3',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentUsers(true)
      .allowDifferentGames(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(1);
    expect((result[0] as any).entries.length).toBe(3);
  });

  it('groups by kind and game if both allowed, not user', () => {
    // same user, different kinds and games -> allowKinds+allowGames should permit grouping
    const s1: UserSport = {
      ...base,
      id: 2,
      user_id: 'u1',
      kind: 'run',
      game: 'g1',
      timedate: '2026-04-22T00:00:00.000Z',
    };
    const s2: UserSport = {
      ...base,
      id: 3,
      user_id: 'u1',
      kind: 'walk',
      game: 'g2',
      timedate: '2026-04-22T01:00:00.000Z',
    };
    const s3: UserSport = {
      ...base,
      id: 4,
      user_id: 'u1',
      kind: 'jump',
      game: 'g3',
      timedate: '2026-04-22T02:00:00.000Z',
    };
    const result = RecentSportsAggregator.builder()
      .allowDifferentKinds(true)
      .allowDifferentGames(true)
      .withNow(now)
      .withMaxWindowMs(3 * 60 * 60 * 1000)
      .aggregate([s1, s2, s3]);
    expect(result.length).toBe(1);
    expect((result[0] as any).entries.length).toBe(3);
  });
});

describe('RecentSportsAggregator interleaving tolerant groups', () => {
  function makeSport(
    id: number,
    user_id: string,
    minutesAgo: number,
    kind = 'running',
  ) {
    const timedate = new Date(
      Date.now() - minutesAgo * 60 * 1000,
    ).toISOString();
    return {
      id,
      kind,
      amount: 1,
      timedate,
      user_id,
      game: 'g',
    } as any;
  }

  it('ignores a single different-user breaker when within interleaving thresholds', () => {
    const now = Date.now();
    const sports = [
      makeSport(1, 'u1', 30),
      makeSport(2, 'u1', 25),
      makeSport(3, 'u2', 20),
      makeSport(4, 'u1', 15),
      makeSport(5, 'u1', 10),
      makeSport(6, 'u1', 5),
    ];

    const res = RecentSportsAggregator.builder()
      .withNow(now)
      .withMinTimeMs(0)
      .withMaxInterleavingCount(5)
      .withMaxInterleavingGapMs(60 * 60 * 1000)
      .aggregate(sports);

    const groups = res.filter((r) => (r as any).entries) as any[];
    const singles = res.filter((r) => !(r as any).entries) as any[];

    expect(groups.length).toBe(1);
    expect(groups[0].entries.length).toBe(5);
    expect(singles.length).toBe(1);
    expect(singles[0].user_id).toBe('u2');
  });

  it('does not ignore breakers when intervening count exceeds threshold', () => {
    const now = Date.now();
    const sports = [
      makeSport(1, 'u1', 80),
      makeSport(2, 'u2', 75),
      makeSport(3, 'u2', 70),
      makeSport(4, 'u2', 65),
      makeSport(5, 'u2', 60),
      makeSport(6, 'u2', 55),
      makeSport(7, 'u2', 50),
      makeSport(8, 'u1', 45),
    ];

    const res = RecentSportsAggregator.builder()
      .withNow(now)
      .withMinTimeMs(0)
      .aggregate(sports);

    const groups = res.filter((r) => (r as any).entries) as any[];
    // Ensure u1 entries are not combined into a single group
    const u1InGroups = groups.reduce(
      (acc, g) => acc + g.entries.filter((e: any) => e.user_id === 'u1').length,
      0,
    );
    expect(u1InGroups).toBeLessThan(2);
  });

  it('does not ignore breakers when time gap between same-user entries exceeds threshold', () => {
    const now = Date.now();
    const sports = [
      makeSport(1, 'u1', 30),
      makeSport(2, 'u2', 20),
      makeSport(3, 'u1', 10),
    ];

    const res = RecentSportsAggregator.builder()
      .withNow(now)
      .withMinTimeMs(0)
      .withMaxInterleavingGapMs(5 * 60 * 1000)
      .aggregate(sports);

    const groups = res.filter((r) => (r as any).entries) as any[];
    const u1Groups = groups.filter((g) =>
      g.entries.every((e: any) => e.user_id === 'u1'),
    );
    expect(u1Groups.length).toBe(0);
  });
});
