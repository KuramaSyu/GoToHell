import { describe, it, expect } from 'vitest';
import { Rating0to3Calculator } from './ratingCalculator';

describe('ratingCalculator', () => {
  it('star rating of 0', () => {
    const calculator = new Rating0to3Calculator();
    const rating = calculator.rate(0);
    expect(rating).toBe(0);
    expect(calculator.reverse(rating)).toBe(0);
  });

  it('with star rating of 0.5 results in 1', () => {
    const calculator = new Rating0to3Calculator();
    const rating = calculator.rate(0.5);
    expect(rating).toBe(1);
    expect(calculator.reverse(rating)).toBe(0.5);
  });

  it('with star rating of 0.8 results in 2.2', () => {
    const calculator = new Rating0to3Calculator();
    const rating = calculator.rate(0.8);
    expect(rating).toBe(2.2);
    expect(calculator.reverse(rating)).toBe(0.8);
  });

  it('with star rating of 1 results in 3', () => {
    const calculator = new Rating0to3Calculator();
    const rating = calculator.rate(1);
    expect(rating).toBe(3);
    expect(calculator.reverse(rating)).toBe(1);
  });
});
