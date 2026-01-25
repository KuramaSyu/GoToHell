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
   * @param goals the goals where we want to calcualte the percentage done
   * @param on_sports the sports on which to calcuate
   * @returns 0 - inf; normally 0 - 1 for 0 - 100%, but it could be done more then 100%
   */
  calculatePercentageDoneAllGoals(
    goals: PersonalGoalData[],
    on_sports: Sport[],
  ): number;
}

export class DefaultPersonalGoalCalculator implements IPersonalGoalCalculator {
  // calculate earliest valid day for a goal
  getEarliestValidDate(goal: PersonalGoalData): Date | null {
    var earliest_valid_date: Date | null = null;
    switch (goal.frequency) {
      case 'daily': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        earliest_valid_date = today;
        break;
      }
      case 'weekly': {
        const today = new Date();
        const day_of_week = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diff_to_monday = (day_of_week + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diff_to_monday);
        monday.setHours(0, 0, 0, 0);
        earliest_valid_date = monday;
        break;
      }
      case 'monthly': {
        const today = new Date();
        const first_of_month = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        first_of_month.setHours(0, 0, 0, 0);
        earliest_valid_date = first_of_month;
        break;
      }
    }
    return earliest_valid_date;
  }

  calculatePercentageDone(goal: PersonalGoalData, on_sports: Sport[]): number {
    const earliest_valid_date = this.getEarliestValidDate(goal);
    if (earliest_valid_date === null) {
      return 0;
    }

    const relevant_sports = on_sports.filter(
      (s) =>
        s.user_id === goal.user_id &&
        s.kind === goal.sport &&
        new Date(s.timedate) >= earliest_valid_date,
    );
    const done_amount_sum = relevant_sports.reduce(
      (accumulated, current_sport) => {
        console.log(`acc: ${accumulated}`);
        return (accumulated += current_sport.amount);
      },
      0,
    );
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
