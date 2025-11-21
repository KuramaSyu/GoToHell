import { GameSelectionMap } from './data/Sports';
import { Timedelta, unitToString } from './Timedelta';

interface SportDescriptionProvider {
  get_supported_sports(): string[];
  get_description(computedValue: number): string | undefined;
}

class TimeDescriptionProvider implements SportDescriptionProvider {
  get_supported_sports(): string[] {
    return ['plank'];
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
  console.log('Getting sport description for', sport, computedValue);
  if (sport === 'plank') {
  }
  if (sport === undefined) return;
  return GameSelectionMap.get(sport) as string;
}
