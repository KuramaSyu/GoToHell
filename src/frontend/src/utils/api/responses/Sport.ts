import { SportScore } from '../../../models/Sport';

// Response coming from [post] /api/sports
export interface PostSportsResponse {
  message: string;
  results: SportScore[];
}

// Response coming from [patch] /api/sports
export interface PatchSportResponse {
  message: string;
  
}
