import { EquipmentWithUsage } from '../../utils/api/responses/Equipment';

/**
 * Sports which currently use equipment tracking, together with the wording
 * shown in the UI. For now only running shoes are supported, but the map is
 * intentionally extensible for other sports/equipment types.
 */
export interface EquipmentSportConfig {
  sport: string;
  /** Plural label, e.g. "Shoes". */
  label: string;
  /** Singular label, e.g. "shoe". */
  singular: string;
  /** Default expected usage in meters (800 km, a common running shoe lifespan). */
  defaultExpectedMeters: number;
  /** Helpful slider range in kilometers. The text input is not limited to it. */
  minKm: number;
  maxKm: number;
}

export const EQUIPMENT_SPORT_CONFIGS: EquipmentSportConfig[] = [
  {
    sport: 'jogging',
    label: 'Shoes',
    singular: 'shoe',
    defaultExpectedMeters: 800_000,
    minKm: 600,
    maxKm: 1000,
  },
];

export const getEquipmentConfig = (
  sport: string | null | undefined,
): EquipmentSportConfig | undefined =>
  EQUIPMENT_SPORT_CONFIGS.find((config) => config.sport === sport);

export const isEquipmentSport = (sport: string | null | undefined): boolean =>
  getEquipmentConfig(sport) !== undefined;

export const metersToKm = (meters: number): number => meters / 1000;

export const kmToMeters = (km: number): number => Math.round(km * 1000);

export const formatMeters = (meters: number): string => {
  const km = metersToKm(meters);
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(km)} km`;
};

export const getUsagePercentage = (
  equipment: EquipmentWithUsage,
): number | null => {
  if (!equipment.expected_usage || equipment.expected_usage <= 0) {
    return null;
  }
  return (
    (equipment.current_usage_meters / equipment.expected_usage) * 100
  );
};

export const getPreferredEquipment = (
  equipment: EquipmentWithUsage[],
  sport: string | null | undefined,
): EquipmentWithUsage | undefined =>
  equipment.find((item) => item.preferred_for_sport === sport);
