import { UserPreferences } from '../models/Preferences';
import { GetSportsResponse } from '../models/Sport';
import { describe, it, expect } from 'vitest';
import {
  BaseSportsCalculatorDecorator,
  DeathDecorator,
  ExactlyOneDecorator,
  HumanLockDecorator,
  MultiplierDecorator,
  OverrideSportDecorator,
  PreferenceRespectingDefaultSportsCalculator,
  SportsCalculator,
} from './SportCalculator';
import { assert } from 'console';

const testingPreferences: UserPreferences = {
  game_overrides: [{ game: 'pubg', sport: 'push-up', amount: 2 }],
  max_deaths: 10,
  multipliers: [
    { game: null, multiplier: 3, sport: 'leg-raises' },
    { game: 'overwatch', multiplier: 2, sport: null },
  ],
  other: {
    instant_open_modal: false,
  },
  sport_specific: {
    plank: {
      seconds: 50,
    },
  },
  ui: {
    displayedGames: [],
    displayedSports: [],
  },
};

const testingSportResponse: GetSportsResponse = {
  games: {
    overwatch: 2,
    league: 3,
    pubg: 4,
  },
  sports: {
    'push-up': 4,
    'leg-raises': 5,
  },
};

export const buildDecoratorStack = (): SportsCalculator => {
  const BASE_SETTINGS = testingSportResponse;
  const preferences = testingPreferences;

  // base for calculating default values with respecting the users overrides
  var base: SportsCalculator = new PreferenceRespectingDefaultSportsCalculator(
    BASE_SETTINGS,
    preferences
  );

  // custom per game per sport overrides
  base = new OverrideSportDecorator(base, preferences.game_overrides);

  // add DeathDecorator, to wrap the output with the death amount
  base = new DeathDecorator(base);

  // custom multipliers, either global or per game and sport
  base = new MultiplierDecorator(base, preferences.multipliers);

  // custom decorator for planks
  base = new HumanLockDecorator(base);

  return base;
};

describe('SportCalculator', () => {
  const calc = buildDecoratorStack();

  it('calculates bare metal', () => {
    expect(calc.calculate_amount('push-up', 'league', 5)).toBe(60); // 3 * 4 * 5 = 60
  });
  //it('calculates pubg by using PUBG-push-up override')
});
