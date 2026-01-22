export enum PersonalGoalFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface PostPutPatchPersonalGoalsRequest {
  sport: string;
  amount: number;
  frequency: PersonalGoalFrequency;
  id: string;
}
