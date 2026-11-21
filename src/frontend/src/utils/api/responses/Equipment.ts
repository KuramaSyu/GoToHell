import { Sport } from '../../../models/Sport';

export interface EquipmentData {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_usage_meters: number;
  expected_usage: number | null;
  preferred_for_sport: string | null;
}

export interface EquipmentWithUsage extends EquipmentData {
  current_usage_meters: number;
  linked_sports: Sport[];
}

export interface GetEquipmentReply {
  data: EquipmentWithUsage[];
}

export interface PostEquipmentReply {
  data: EquipmentData;
}
