import { SportScore } from '../../../models/Sport';

export interface PostSportsResponse {
  message: string;
  results: SportScore[];
}

export interface PatchSportResponse {
  message: string;
  
}
