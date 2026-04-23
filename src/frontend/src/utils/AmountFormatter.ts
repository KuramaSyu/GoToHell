export type NumberAndUnit = { num: number; unit?: string };

export class AmountFormatter {
  private distanceSports: Set<string>;
  private countKDefault: boolean;

  constructor(distanceSports: Set<string>, countKDefault = true) {
    this.distanceSports = distanceSports;
    this.countKDefault = countKDefault;
  }

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

  static Builder = class {
    private distanceSports: Set<string> = new Set();
    private countKDefault = true;

    addDistance(...sports: string[]) {
      for (const s of sports) this.distanceSports.add(s);
      return this;
    }

    setCountKDefault(enabled: boolean) {
      this.countKDefault = enabled;
      return this;
    }

    build() {
      return new AmountFormatter(this.distanceSports, this.countKDefault);
    }
  };
}

export const defaultAmountFormatter = new AmountFormatter.Builder()
  .addDistance('jogging', 'cycling')
  .setCountKDefault(true)
  .build();
