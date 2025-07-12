import { SportScore } from '../../../models/Sport';

export interface PostSportsResponse {
  message: string;
  results: SportScore[];
}
