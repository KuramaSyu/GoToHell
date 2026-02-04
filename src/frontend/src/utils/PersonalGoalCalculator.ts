import { Sport } from '../models/Sport';
import { useSportStore } from '../useSportStore';
import { usePersonalGoalsStore } from '../zustand/PersonalGoalsStore';
import { useRecentSportsStore } from '../zustand/RecentSportsState';
import { PersonalGoalData } from './api/responses/PersonalGoals';

export interface IPersonalGoalCalculator {
  /**
   *
   * @param goal the goal where we want to calcualte the percentage done
   * @param on_sports the sports on which to calcuate
   * @returns 0 - inf; normally 0 - 1 for 0 - 100%, but it could be done more then 100%
   */
  calculatePercentageDone(goal: PersonalGoalData, on_sports: Sport[]): number;

  /**
   *
   * @param goal the goal where we want to calcualte the percentage done
   * @param on_sports the sports on which to calcuate
   * @returns number; the amount of remaining exercises
   */
  calculateExercisesDone(goal: PersonalGoalData, on_sports: Sport[]): number;

  /**
   *
   * @param goals the goals where we want to calcualte the percentage done
   * @param on_sports the sports on which to calcuate
   * @returns 0 - inf; normally 0 - 1 for 0 - 100%, but it could be done more then 100%
   */
  calculatePercentageDoneAllGoals(
    goals: PersonalGoalData[],
    on_sports: Sport[],
  ): number;

  /**
   * @param goal the goal
   * @returns the last possible time where sports can be counted towards the goal
   */
  getLastPossibleTime(goal: PersonalGoalData): Date;
}

export class DefaultPersonalGoalCalculator implements IPersonalGoalCalculator {
  // calculate earliest valid day for a goal
  getEarliestValidDate(goal: PersonalGoalData): Date | null {
    var earliest_valid_date: Date | null = null;
    switch (goal.frequency) {
      case 'daily': {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        earliest_valid_date = today;
        break;
      }
      case 'weekly': {
        const today = new Date();
        const day_of_week = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
        const diff_to_monday = (day_of_week + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diff_to_monday);
        monday.setUTCHours(0, 0, 0, 0);
        earliest_valid_date = monday;
        break;
      }
      case 'monthly': {
        const today = new Date();
        const first_of_month = new Date(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          1,
        );
        first_of_month.setUTCHours(0, 0, 0, 0);
        earliest_valid_date = first_of_month;
        break;
      }
    }
    return earliest_valid_date;
  }

  getLastPossibleTime(goal: PersonalGoalData): Date {
    const now = new Date();
    switch (goal.frequency) {
      case 'daily': {
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(now.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        return tomorrow;
      }
      case 'weekly': {
        const next_monday = new Date(now);
        next_monday.setDate(now.getDate() + ((8 - now.getUTCDay()) % 7));
        next_monday.setUTCHours(0, 0, 0, 0);
        return next_monday;
      }
      case 'monthly': {
        const next_month = new Date(now);
        next_month.setUTCMonth(now.getUTCMonth() + 1);
        next_month.setUTCDate(1);
        next_month.setUTCHours(0, 0, 0, 0);
        return next_month;
      }
    }
    return now;
  }

  calculateExercisesDone(goal: PersonalGoalData, on_sports: Sport[]): number {
    // get ealiest possbile date
    const earliest_valid_date = this.getEarliestValidDate(goal);
    if (earliest_valid_date === null) {
      return 0;
    }

    // filter all sports, where:
    // - user matches
    // - sport matches
    // - date is in range (older then earliest possible)
    const relevant_sports = on_sports.filter(
      (s) =>
        s.user_id === goal.user_id &&
        s.kind === goal.sport &&
        new Date(s.timedate) >= earliest_valid_date,
    );

    // summarize sport exercises done
    const done_amount_sum = relevant_sports.reduce(
      (accumulated, current_sport) => {
        return (accumulated += current_sport.amount);
      },
      0,
    );
    return done_amount_sum;
  }

  calculatePercentageDone(goal: PersonalGoalData, on_sports: Sport[]): number {
    const done_amount_sum = this.calculateExercisesDone(goal, on_sports);
    return done_amount_sum / goal.amount;
  }

  calculatePercentageDoneAllGoals(
    goals: PersonalGoalData[],
    on_sports: Sport[],
  ): number {
    return goals
      .map((g) => this.calculatePercentageDone(g, on_sports) / goals.length)
      .reduce(
        (accumulated, current_goal_percentage) =>
          (accumulated += current_goal_percentage),
        0,
      );
  }
}
