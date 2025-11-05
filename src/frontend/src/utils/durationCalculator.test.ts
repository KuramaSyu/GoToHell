import { describe } from 'node:test';
import { expect, it } from 'vitest';
import { DurationCalculator } from './durationCalculator';

describe('DurationCalculator', () => {
  it('incremets percentage and duration correctly', () => {
    const calc = new DurationCalculator(100, 10);
    expect(calc.get_step_ms()).toBe(10);
    expect(calc.get_step_percentage()).toBe(10);
  });

  it('increments steps correctly', () => {
    const calc = new DurationCalculator(100, 10);
    calc.next_step();
    calc.next_step();
    expect(calc.current_step.get_n()).toBe(3);
    expect(calc.current_step.get_percentage().toPrecision(3)).toBe('30.0');
  });

  it('detects completion correctly', () => {
    const calc = new DurationCalculator(100, 10);
    for (let i = 0; i < 9; i++) {
      expect(calc.is_completed()).toBe(false);
      calc.next_step();
    }
    expect(calc.is_completed()).toBe(true);
  });
});
