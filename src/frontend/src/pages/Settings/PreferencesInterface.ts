import { OverrideSportDefinition } from '../../useSportStore';

interface Multiplier {
  game: string | null; // null means it's used global
  multiplier: number;
}
export interface UserPreferences {
  game_overrides: OverrideSportDefinition[];
  multipliers: Multiplier[];
}
