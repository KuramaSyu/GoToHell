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

var testingPreferences: UserPreferences = {
  game_overrides: [
    { game: 'pubg', sport: 'push-up', amount: 6 },
    { game: 'pubg', sport: 'leg-raises', amount: 2 },
  ],
  max_deaths: 10, // currently not in use
  multipliers: [{ game: 'overwatch', multiplier: 2, sport: null }],
  other: {
    instant_open_modal: false,
  },
  sport_specific: {
    plank: {
      seconds: 100,
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
    plank: 1,
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
  var calc = buildDecoratorStack();

  it('calculates bare metal', () => {
    expect(calc.calculate_amount('push-up', 'league', 5)).toBe(60); // 3 * 4 * 5 = 60
  });
  it('calculates the deaths from amount', () => {
    expect(calc.calculate_deaths('push-up', 'league', 60)).toBe(5); // 60 / (3 * 4) = 5
  });
  it('calculates pubg by using PUBG-push-up override', () => {
    expect(calc.calculate_amount('push-up', 'pubg', 5)).toBe(30); // 6 * 5 = 30
  });
  it('calcuates pubg deaths by using PUBG-push-up override', () => {
    expect(calc.calculate_deaths('push-up', 'pubg', 30)).toBe(5); // 30 / 6 = 5
  });

  // set gobal multiplier to 3
  testingPreferences = {
    ...testingPreferences,
    multipliers: [
      ...testingPreferences.multipliers,
      { game: null, multiplier: 3, sport: null },
    ],
  };
  it('calculates pubg by using PUBG-leg-raise override the gobal multiplier', () => {
    calc = buildDecoratorStack();
    expect(calc.calculate_amount('leg-raises', 'pubg', 5)).toBe(30); // 2 (pubg-legraises) * 3 (multiplier) * 5 = 30
  });
  it('calculates the deaths from amount for pubg using the PUBG-leg-raise override and the global multiplier', () => {
    expect(calc.calculate_deaths('leg-raises', 'pubg', 30)).toBe(5); // 30 / (2 * 3) = 5
  });
  var strength_factor = 1;
  it('1.1 calculate strength factor for plank', () => {
    // at 10 deaths and game base 1, the result should be plank.seconds
    let strength_log = Math.log(1 + 10 * 1 * 1) / Math.log(1.75);

    strength_factor =
      testingPreferences.sport_specific.plank.seconds / strength_log;
    const temp_calculator = new HumanLockDecorator(calc);
    expect(temp_calculator.strength_factor(10, 'plank', 'league')).toBe(
      strength_factor
    );
  });
  it('1.2 calculates league plank by using plank decorator and global multiplier', () => {
    var deaths = 12;
    var multiplier = 3;
    var game_base = 3;
    let log_calculation =
      Math.log(1 + deaths * multiplier * game_base) / Math.log(1.75);

    let result = Math.round(strength_factor * log_calculation);
    expect(calc.calculate_amount('plank', 'league', deaths)).toBe(result);
  });
  it('1.3 calculates league plank deaths by using the given amount with plank decorator and global multiplier', () => {
    var deaths = 12;
    var multiplier = 3;
    var game_base = 3;
    let log_calculation =
      Math.log(1 + deaths * multiplier * game_base) / Math.log(1.75);

    let amount = Math.round(strength_factor * log_calculation);
    expect(Math.round(calc.calculate_deaths('plank', 'league', amount))).toBe(
      deaths
    );
  });
});
