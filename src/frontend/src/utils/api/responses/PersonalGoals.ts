import { PersonalGoalFrequency } from '../requests/PersonalGoals';

export interface PersonalGoalData {
  id: string;
  sport: string;
  amount: number;
  frequency: PersonalGoalFrequency;
  user_id: string;
}

export interface GetPersonalGoalsReply {
  data: PersonalGoalData[];
}
