import { create } from 'zustand';
import { PersonalGoalData } from '../utils/api/responses/PersonalGoals';

interface PersonalGoalsState {
  personalGoalsList: PersonalGoalData[];
  loaded: boolean;
  setPersonalGoals: (personalGoalsList: PersonalGoalData[]) => void;
}

export const usePersonalGoalsStore = create<PersonalGoalsState>((set) => ({
  personalGoalsList: [],
  loaded: false,
  setPersonalGoals: (personalGoalsList: PersonalGoalData[]) =>
    set({
      personalGoalsList: personalGoalsList,
      loaded: true,
    }),
}));
