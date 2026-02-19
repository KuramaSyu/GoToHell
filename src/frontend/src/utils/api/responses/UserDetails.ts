import { StreakData } from '../../../models/Streak';
import { Sport } from '../../../models/Sport';
import { PersonalGoalData } from './PersonalGoals';

export interface UserDetails {
  current_streak: StreakData;
  longest_streak: StreakData;
  goals: PersonalGoalData[];
  last_activities: Sport[];
}

export interface GetUserDetailsResponse {
  id: number;
  username: string;
  discriminator: string;
  avatar: string;
  current_streak: StreakData;
  longest_streak: StreakData;
  goals: PersonalGoalData[];
  last_activities: Sport[];
}
