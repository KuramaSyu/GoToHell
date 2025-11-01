import { describe } from 'node:test';
import { expect, it } from 'vitest';
import { DurationCalculator } from './durationCalculator';
import { ca } from 'zod/v4/locales/index.cjs';

describe('DurationCalculator', () => {
  it('incremets percentage and duration correctly', () => {
    const calc = new DurationCalculator(100, 10);
    expect(calc.get_step_ms()).toBe(10);
    expect(calc.get_step_percentage()).toBe(0.1);
  });

  it('increments steps correctly', () => {
    const calc = new DurationCalculator(100, 10);
    calc.next_step();
    calc.next_step();
    expect(calc.current_step.get_n()).toBe(3);
    expect(calc.current_step.get_percentage().toPrecision(3)).toBe('0.300');
  });
});
