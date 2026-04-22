import { GameSelectionMap } from './data/Sports';
import { Timedelta, unitToString } from './Timedelta';

interface SportDescriptionProvider {
  get_supported_sports(): string[];
  get_description(computedValue: number, sport: string): string | undefined;
  is_supported(sport: string): boolean;
  get_name(sport_id: string): string;
}

abstract class SportDescriptionProviderABC implements SportDescriptionProvider {
  abstract get_supported_sports(): string[];
  abstract get_description(
    computedValue: number,
    sport: string,
  ): string | undefined;
  is_supported(sport: string): boolean {
    return this.get_supported_sports().includes(sport);
  }
  get_name(sport_id: string): string {
    return GameSelectionMap.get(sport_id) ?? sport_id;
  }
}

export class TimeDescriptionProvider extends SportDescriptionProviderABC {
  get_supported_sports(): string[] {
    return ['plank', 'workout'];
  }

  get_description(computedValue: number, sport: string): string | undefined {
    const timedelta = new Timedelta(computedValue);
    const biggestUnit = timedelta.biggestUnit();
    return unitToString(biggestUnit);
  }
}

export class DefaultDescriptionProvider extends SportDescriptionProviderABC {
  get_supported_sports(): string[] {
    return [];
  }

  get_description(computedValue: number, sport: string): string | undefined {
    return `${this.get_name(sport)}`;
  }
}

export class DistanceDescriptionProvider extends SportDescriptionProviderABC {
  get_supported_sports(): string[] {
    return ['jogging', 'cycling'];
  }

  get_description(computedValue: number, sport: string): string | undefined {
    if (computedValue >= 1000) {
      return 'km';
    }
    return 'm';
  }
}

/**
 * Returns both the sport name and a human readable description (name + unit/value).
 */
export function getSportNameAndDescription(
  sport: string | undefined,
  computedValue: number,
): string | undefined {
  if (sport === undefined) return;

  // Time sports: use TimeDescriptionProvider to get unit string, but include name
  const timeProvider = new TimeDescriptionProvider();
  if (timeProvider.is_supported(sport)) {
    const timedelta = new Timedelta(computedValue);
    const biggestUnit = timedelta.biggestUnit();
    return `${timeProvider.get_name(sport)} ${unitToString(biggestUnit)}`;
  }

  // Distance sports: include formatted value with m/km
  const distanceProvider = new DistanceDescriptionProvider();
  if (distanceProvider.is_supported(sport)) {
    if (computedValue >= 1000) {
      const km = computedValue / 1000;
      const formatted = km % 1 === 0 ? `${km}` : `${km.toFixed(1)}`;
      return `${distanceProvider.get_name(sport)} ${formatted} km`;
    }
    return `${distanceProvider.get_name(sport)} ${computedValue} m`;
  }

  // Default: just the name
  return new DefaultDescriptionProvider().get_name(sport);
}

/**
 * @param sport the sport to get the description for
 * @param computedValue the value belonging to the sport. This is only used for plank (for second/minute/hour)
 * @returns description or the unit for the sport
 */
export function getSportDescription(
  sport: string | undefined,
  computedValue: number,
): string | undefined {
  let providers: SportDescriptionProvider[] = [
    new TimeDescriptionProvider(),
    new DistanceDescriptionProvider(),
    new DefaultDescriptionProvider(),
  ];
  for (const provider of providers) {
    if (sport !== undefined && provider.is_supported(sport)) {
      return provider.get_description(computedValue, sport);
    }
  }
  if (sport === undefined) return;
  return new DefaultDescriptionProvider().get_description(computedValue, sport);
}

/**
 * Returns the display name for a sport, e.g. "Plank" for "plank"
 * @param sport the sport to get the name for
 * @return the display name for the sport
 */
export function getSportName(sport: string): string {
  let providers: SportDescriptionProvider[] = [
    new TimeDescriptionProvider(),
    new DistanceDescriptionProvider(),
    new DefaultDescriptionProvider(),
  ];
  for (const provider of providers) {
    if (sport !== undefined && provider.is_supported(sport)) {
      return provider.get_name(sport);
    }
  }
  return new DefaultDescriptionProvider().get_name(sport);
}
