import { GameSelectionMap } from './data/Sports';
import { Timedelta, unitToString } from './Timedelta';

interface SportDescriptionProvider {
  get_supported_sports(): string[];
  get_description(computedValue: number): string | undefined;
  is_supported(sport: string): boolean;
}

abstract class SportDescriptionProviderABC implements SportDescriptionProvider {
  abstract get_supported_sports(): string[];
  abstract get_description(computedValue: number): string | undefined;
  is_supported(sport: string): boolean {
    return this.get_supported_sports().includes(sport);
  }
}
class TimeDescriptionProvider extends SportDescriptionProviderABC {
  get_supported_sports(): string[] {
    return ['plank', 'workout'];
  }

  get_description(computedValue: number): string | undefined {
    const timedelta = new Timedelta(computedValue);
    const biggestUnit = timedelta.biggestUnit();
    return unitToString(biggestUnit);
  }
}

/**
 * @param sport the sport to get the description for
 * @param computedValue the value belonging to the sport. This is only used for plank (for second/minute/hour)
 * @returns description or the unit for the sport
 */
export function getSportDescription(
  sport: string | undefined,
  computedValue: number
): string | undefined {
  let providers: SportDescriptionProvider[] = [new TimeDescriptionProvider()];
  for (const provider of providers) {
    if (sport !== undefined && provider.is_supported(sport)) {
      return provider.get_description(computedValue);
    }
  }
  if (sport === undefined) return;
  return GameSelectionMap.get(sport) as string;
}
