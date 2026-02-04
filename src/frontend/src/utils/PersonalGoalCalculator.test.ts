import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Rating0to3Calculator } from './ratingCalculator';
import {
  DefaultPersonalGoalCalculator,
  IPersonalGoalCalculator,
} from './PersonalGoalCalculator';
import SportRow, { Sport } from '../models/Sport';
import { PersonalGoalData } from './api/responses/PersonalGoals';
import { PersonalGoalFrequency } from './api/requests/PersonalGoals';

describe('PersonalGoalCalculator which calculates the percentage done of goals', () => {
  beforeEach(() => {
    // a sunday
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('star rating of 0', () => {
    const calculator: IPersonalGoalCalculator =
      new DefaultPersonalGoalCalculator();
    const exercises: Sport[] = [
      {
        amount: 5,
        game: 'league',
        kind: 'pushups',
        timedate: '2024-01-01T10:00:00Z',
        user_id: '123',
        id: 1,
      },
      {
        amount: 5,
        game: 'league',
        kind: 'situps',
        timedate: '2024-01-01T10:00:00Z',
        user_id: '123',
        id: 3,
      },
    ];
    const goal: PersonalGoalData = {
      amount: 20,
      frequency: PersonalGoalFrequency.DAILY,
      sport: 'pushups',
      user_id: '123',
      id: 'goal1',
    };
    const percentage = calculator.calculatePercentageDone(goal, exercises);
    expect(percentage).toBe(0.25);
  });
});
