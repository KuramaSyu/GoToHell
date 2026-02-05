import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DefaultPersonalGoalCalculator,
  IPersonalGoalCalculator,
} from './PersonalGoalCalculator';
import { Sport } from '../models/Sport';
import { PersonalGoalData } from './api/responses/PersonalGoals';
import { PersonalGoalFrequency } from './api/requests/PersonalGoals';

// Test fixtures
const createSports = {
  sameDay: (): Sport[] => [
    {
      amount: 10,
      game: 'league',
      kind: 'pushups',
      timedate: '2024-01-01T10:00:00Z',
      user_id: 'user1',
      id: 1,
    },
    {
      amount: 5,
      game: 'league',
      kind: 'pushups',
      timedate: '2024-01-01T14:00:00Z',
      user_id: 'user1',
      id: 2,
    },
    {
      amount: 8,
      game: 'dota',
      kind: 'situps',
      timedate: '2024-01-01T16:00:00Z',
      user_id: 'user1',
      id: 3,
    },
  ],

  differentDays: (): Sport[] => [
    {
      amount: 12,
      game: 'league',
      kind: 'pushups',
      timedate: '2024-01-01T10:00:00Z',
      user_id: 'user1',
      id: 1,
    },
    {
      amount: 8,
      game: 'dota',
      kind: 'pushups',
      timedate: '2024-01-02T10:00:00Z',
      user_id: 'user1',
      id: 2,
    },
    {
      amount: 15,
      game: 'league',
      kind: 'squats',
      timedate: '2023-12-31T22:00:00Z', // Previous day
      user_id: 'user1',
      id: 3,
    },
  ],

  weeklySpread: (): Sport[] => [
    // Monday
    {
      amount: 10,
      game: 'league',
      kind: 'pushups',
      timedate: '2024-01-01T10:00:00Z',
      user_id: 'user1',
      id: 1,
    },
    // Tuesday
    {
      amount: 15,
      game: 'dota',
      kind: 'pushups',
      timedate: '2024-01-02T10:00:00Z',
      user_id: 'user1',
      id: 2,
    },
    // Wednesday
    {
      amount: 12,
      game: 'league',
      kind: 'pushups',
      timedate: '2024-01-03T10:00:00Z',
      user_id: 'user1',
      id: 3,
    },
    // Different user
    {
      amount: 20,
      game: 'dota',
      kind: 'pushups',
      timedate: '2024-01-01T10:00:00Z',
      user_id: 'user2',
      id: 4,
    },
  ],

  multipleUsers: (): Sport[] => [
    {
      amount: 10,
      game: 'league',
      kind: 'pushups',
      timedate: '2024-01-01T10:00:00Z',
      user_id: 'user1',
      id: 1,
    },
    {
      amount: 15,
      game: 'dota',
      kind: 'pushups',
      timedate: '2024-01-01T11:00:00Z',
      user_id: 'user2',
      id: 2,
    },
    {
      amount: 8,
      game: 'league',
      kind: 'situps',
      timedate: '2024-01-01T12:00:00Z',
      user_id: 'user1',
      id: 3,
    },
  ],
};

const createGoals = {
  daily: (overrides: Partial<PersonalGoalData> = {}): PersonalGoalData => ({
    amount: 20,
    frequency: PersonalGoalFrequency.DAILY,
    sport: 'pushups',
    user_id: 'user1',
    id: 'daily-goal',
    ...overrides,
  }),

  weekly: (overrides: Partial<PersonalGoalData> = {}): PersonalGoalData => ({
    amount: 50,
    frequency: PersonalGoalFrequency.WEEKLY,
    sport: 'pushups',
    user_id: 'user1',
    id: 'weekly-goal',
    ...overrides,
  }),

  monthly: (overrides: Partial<PersonalGoalData> = {}): PersonalGoalData => ({
    amount: 200,
    frequency: PersonalGoalFrequency.MONTHLY,
    sport: 'pushups',
    user_id: 'user1',
    id: 'monthly-goal',
    ...overrides,
  }),
};

describe('PersonalGoalCalculator', () => {
  let calculator: IPersonalGoalCalculator;

  beforeEach(() => {
    vi.useFakeTimers();
    calculator = new DefaultPersonalGoalCalculator();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculatePercentageDone', () => {
    it('should calculate 75% completion for daily goal with 15 out of 20 exercises', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z')); // Monday
      const sports = createSports.sameDay();
      const goal = createGoals.daily();

      // 10 + 5 = 15 out of 20 = 0.75
      const percentage = calculator.calculatePercentageDone(goal, sports);
      expect(percentage).toBe(0.75);
    });

    it('should calculate 120% completion when exceeding daily goal', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goal = createGoals.daily({ amount: 10 }); // Lower target

      // 10 + 5 = 15 out of 10 = 1.5 (150%)
      const percentage = calculator.calculatePercentageDone(goal, sports);
      expect(percentage).toBe(1.5);
    });

    it('should only count exercises for the specific user', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.multipleUsers();
      const goal = createGoals.daily({ user_id: 'user1' });

      // Only user1's pushups: 10 out of 20 = 0.5
      const percentage = calculator.calculatePercentageDone(goal, sports);
      expect(percentage).toBe(0.5);
    });

    it('should only count exercises of the correct sport type', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goal = createGoals.daily({ sport: 'situps' });

      // Only situps: 8 out of 20 = 0.4
      const percentage = calculator.calculatePercentageDone(goal, sports);
      expect(percentage).toBe(0.4);
    });
  });

  describe('calculateExercisesDone', () => {
    it('should sum all exercises for daily goal within the same day', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goal = createGoals.daily();

      const exercisesDone = calculator.calculateExercisesDone(goal, sports);
      expect(exercisesDone).toBe(15); // 10 + 5
    });

    it('should sum exercises for weekly goal across multiple days', () => {
      vi.setSystemTime(new Date('2024-01-03T12:00:00Z')); // Wednesday
      const sports = createSports.weeklySpread();
      const goal = createGoals.weekly();

      // All pushups for user1: 10 + 15 + 12 = 37
      const exercisesDone = calculator.calculateExercisesDone(goal, sports);
      expect(exercisesDone).toBe(37);
    });

    it('should return 0 when no matching exercises found', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goal = createGoals.daily({
        sport: 'squats',
        user_id: 'nonexistent',
      });

      const exercisesDone = calculator.calculateExercisesDone(goal, sports);
      expect(exercisesDone).toBe(0);
    });

    it('should exclude exercises from previous periods', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.differentDays();
      const goal = createGoals.daily();

      // Only current day: 12 (excludes previous day's 15)
      const exercisesDone = calculator.calculateExercisesDone(goal, sports);
      expect(exercisesDone).toBe(12);
    });
  });

  describe('calculatePercentageDoneAllGoals', () => {
    it('should calculate average percentage across multiple goals', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goals = [
        createGoals.daily({ amount: 10 }), // 15/10 = 1.5 (150%)
        createGoals.daily({ amount: 30, sport: 'situps' }), // 8/30 = 0.267 (26.7%)
      ];

      // Average: (1.5 + 0.267) / 2 = 0.883
      const percentage = calculator.calculatePercentageDoneAllGoals(
        goals,
        sports,
      );
      expect(percentage).toBeCloseTo(0.883, 2);
    });

    it('should return 0 when no goals provided', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goals: PersonalGoalData[] = [];

      const percentage = calculator.calculatePercentageDoneAllGoals(
        goals,
        sports,
      );
      expect(percentage).toBe(0);
    });

    it('should handle goals with different frequencies', () => {
      vi.setSystemTime(new Date('2024-01-03T12:00:00Z')); // Wednesday
      const sports = createSports.weeklySpread();
      const goals = [
        createGoals.daily({ amount: 10 }), // Today only: 12/10 = 1.2
        createGoals.weekly({ amount: 40 }), // This week: 37/40 = 0.925
      ];

      // Average: (1.2 + 0.925) / 2 = 1.0625
      const percentage = calculator.calculatePercentageDoneAllGoals(
        goals,
        sports,
      );
      expect(percentage).toBeCloseTo(1.0625, 3);
    });
  });

  describe('getLastPossibleTime', () => {
    it('should return tomorrow at midnight for daily goals', () => {
      vi.setSystemTime(new Date('2024-01-01T15:30:00Z')); // Monday afternoon
      const goal = createGoals.daily();

      const lastTime = calculator.getLastPossibleTime(goal);
      expect(lastTime).toEqual(new Date('2024-01-02T00:00:00Z'));
    });

    it('should return next Monday at midnight for weekly goals', () => {
      vi.setSystemTime(new Date('2024-01-03T15:30:00Z')); // Wednesday afternoon
      const goal = createGoals.weekly();

      const lastTime = calculator.getLastPossibleTime(goal);
      expect(lastTime).toEqual(new Date('2024-01-08T00:00:00Z')); // Next Monday
    });

    it('should return first day of next month for monthly goals', () => {
      vi.setSystemTime(new Date('2024-01-15T15:30:00Z')); // Mid-January
      const goal = createGoals.monthly();

      const lastTime = calculator.getLastPossibleTime(goal);
      expect(lastTime).toEqual(new Date('2024-02-01T00:00:00Z'));
    });

    it('should handle Sunday correctly for weekly goals', () => {
      vi.setSystemTime(new Date('2024-01-07T15:30:00Z')); // Sunday
      const goal = createGoals.weekly();

      const lastTime = calculator.getLastPossibleTime(goal);
      expect(lastTime).toEqual(new Date('2024-01-08T00:00:00Z')); // Next Monday
    });

    it('should handle end of year for monthly goals', () => {
      vi.setSystemTime(new Date('2024-12-15T15:30:00Z')); // Mid-December
      const goal = createGoals.monthly();

      const lastTime = calculator.getLastPossibleTime(goal);
      expect(lastTime).toEqual(new Date('2025-01-01T00:00:00Z'));
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle leap year for monthly goals', () => {
      vi.setSystemTime(new Date('2024-02-15T15:30:00Z')); // Mid-February in leap year
      const goal = createGoals.monthly();

      const lastTime = calculator.getLastPossibleTime(goal);
      expect(lastTime).toEqual(new Date('2024-03-01T00:00:00Z'));
    });

    it('should handle sports at exact boundary times for daily goals', () => {
      vi.setSystemTime(new Date('2024-01-01T23:59:59Z')); // End of day
      const sports: Sport[] = [
        {
          amount: 10,
          game: 'league',
          kind: 'pushups',
          timedate: '2024-01-01T23:59:59Z', // Exact same time
          user_id: 'user1',
          id: 1,
        },
      ];
      const goal = createGoals.daily();

      const exercisesDone = calculator.calculateExercisesDone(goal, sports);
      expect(exercisesDone).toBe(10);
    });

    it('should handle zero amount goals gracefully', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
      const sports = createSports.sameDay();
      const goal = createGoals.daily({ amount: 0 });

      const percentage = calculator.calculatePercentageDone(goal, sports);
      expect(percentage).toBe(Infinity); // 15/0 = Infinity
    });
  });
});
