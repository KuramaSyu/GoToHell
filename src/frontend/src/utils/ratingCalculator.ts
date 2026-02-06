export interface IRatingCalculator {
  rate(x: number): number;
  reverse(y: number | null): number | null;
}

export class Rating0to3Calculator implements IRatingCalculator {
  /**
   *
   * @param sport sport
   * @param rating 0-1; 50% is normal multiplier (1)
   */
  rate = (x: number): number => {
    if (x <= 0.5) {
      return x * 2;
    } else {
      return 1 + (x - 0.5) * 4;
    }
  };

  /**
   *
   * @param y; 0-3
   * @returns x - a value from 0 - 1
   */
  reverse = (y: number | null): number | null => {
    if (y === null) return null;
    if (y <= 1) {
      return y / 2;
    } else {
      // y = 1 + (x - 0.5) * 4
      // ((y - 1) / 4) = x - 0.5
      // ((y - 1) / 4) + 0.5 = x
      return (y - 1) / 4 + 0.5;
    }
  };
}
