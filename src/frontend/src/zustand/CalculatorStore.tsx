import { create } from 'zustand';
import { UserPreferences } from '../models/Preferences';
import {
  DefaultSportsCalculator,
  ExactlyOneDecorator,
  MultiplierDecorator,
  OverrideSportDecorator,
  SportsCalculator,
} from '../utils/SportCalculator';
interface DeathCalculatorState {
  calculator: SportsCalculator;
  setCalculator: (calculator: SportsCalculator) => void;
}

const useCalculatorStore = create<DeathCalculatorState>((set) => ({
  calculator: new DefaultSportsCalculator({
    sports: {},
    games: {},
  }),
  setCalculator: (calculator: SportsCalculator) =>
    set({ calculator: calculator }),
}));

export default useCalculatorStore;
