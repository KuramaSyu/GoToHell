/**
 * Numeric value with optional unit returned from `formatNumberAndUnit`.
 * - `num`: normalized numeric value (rounded or compacted)
 * - `unit`: optional unit string (e.g. 'm', 'km', 'K')
 */
export type NumberAndUnit = { num: number; unit?: string };

/**
 * Utility to format numeric amounts for different sport types.
 *
 * Usage notes:
 * - For distance sports (configured via the Builder) `formatNumberAndUnit`
 *   will return `{ num, unit }` where `unit` is 'm' or 'km'.
 * - For count-style values a compact 'K' suffix is returned when enabled
 *   and the value >= 1000.
 * - `formatCompact` is a convenience that returns a single string like
 *   '1.2 km', '800 m' or '2K'.
 */
export class AmountFormatter {
  private distanceSports: Set<string>;
  private countKDefault: boolean;

  /**
   * @param {Set<string>} distanceSports - set of sport keys treated as distances (e.g. 'jogging')
   * @param {boolean} [countKDefault=true] - enable compact K-formatting for large counts
   */
  constructor(distanceSports: Set<string>, countKDefault = true) {
    this.distanceSports = distanceSports;
    this.countKDefault = countKDefault;
  }

  /**
   * Return a compact string representation for `value`.
   *
   * @param {number} value - raw numeric value (meters for distance sports)
   * @param {string} [sport] - optional sport key to apply sport-specific formatting
   * @returns {string} compact formatted string (e.g. '1.2 km', '800 m', '2K')
   */
  formatCompact(value: number, sport?: string): string {
    if (sport && this.distanceSports.has(sport)) {
      // distance formatting: return like '1.2 km' or '800 m'
      const r = this.formatNumberAndUnit(value, sport);
      if (r.unit) return `${r.num} ${r.unit}`;
      return `${r.num}`;
    }
    // fallback: K suffix for large numbers
    if (this.countKDefault && value >= 1000) {
      const v = value / 1000;
      return v % 1 === 0 ? `${v}K` : `${v.toFixed(1)}K`;
    }
    return `${value}`;
  }

  /**
   * Normalize a raw numeric `value` and return `{ num, unit? }`.
   *
   * @param {number} value - raw numeric value to normalize
   * @param {string} [sport] - optional sport key to apply sport-specific formatting
   * @returns {NumberAndUnit} object with normalized `num` and optional `unit`
   */
  formatNumberAndUnit(value: number, sport?: string): NumberAndUnit {
    if (sport && this.distanceSports.has(sport)) {
      if (value >= 1000) {
        const km = value / 1000;
        const formatted = km % 1 === 0 ? km : parseFloat(km.toFixed(1));
        return { num: formatted, unit: 'km' };
      }
      return { num: Math.round(value), unit: 'm' };
    }
    // not a distance sport: return raw number (no unit)
    if (this.countKDefault && value >= 1000) {
      const v = value / 1000;
      const formatted = v % 1 === 0 ? v : parseFloat(v.toFixed(1));
      return { num: formatted, unit: 'K' };
    }
    return { num: Math.round(value) };
  }

  /**
   * Builder for `AmountFormatter` to configure which sports are treated
   * as distance sports and whether compact K-formatting is enabled.
   */
  static Builder = class {
    private distanceSports: Set<string> = new Set();
    private countKDefault = true;

    /**
     * Mark the provided sport keys as distance-based (meters/kilometers).
     * @param {...string} sports - sport keys to treat as distance-based
     * @returns {this}
     */
    addDistance(...sports: string[]) {
      for (const s of sports) this.distanceSports.add(s);
      return this;
    }

    /**
     * Enable or disable compact K-formatting for large counts.
     * @param {boolean} enabled
     * @returns {this}
     */
    setCountKDefault(enabled: boolean) {
      this.countKDefault = enabled;
      return this;
    }

    /**
     * Build the configured `AmountFormatter` instance.
     * @returns {AmountFormatter}
     */
    build() {
      return new AmountFormatter(this.distanceSports, this.countKDefault);
    }
  };
}

/**
 * Default shared formatter used across the app.
 * - Treats 'jogging' and 'cycling' as distance sports and enables
 *   compact K formatting for large counts.
 */
/**
 * Default shared formatter used across the app.
 * - Treats 'jogging' and 'cycling' as distance sports and enables
 *   compact K formatting for large counts.
 * @type {AmountFormatter}
 */
export const defaultAmountFormatter = new AmountFormatter.Builder()
  .addDistance('jogging', 'cycling')
  .setCountKDefault(true)
  .build();
