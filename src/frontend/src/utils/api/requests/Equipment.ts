export interface PostEquipmentRequest {
  name: string;
  description: string;
  start_usage_meters: number;
  expected_usage: number | null;
  preferred_for_sport: string | null;
}

export interface PatchEquipmentRequest {
  id: string;
  name?: string;
  description?: string;
  start_usage_meters?: number;
  expected_usage?: number | null;
  clear_expected_usage?: boolean;
  preferred_for_sport?: string | null;
}
