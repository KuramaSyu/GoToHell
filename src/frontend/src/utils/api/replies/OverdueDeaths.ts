import { OverdueDeaths } from '../../../models/OverdueDeaths';

// interface for GET /overdue-deaths
export interface GetOverdueDeathsReply {
  data: OverdueDeaths[];
}

// interface for POST /overdue-deaths
// this is just the exact data stored to the backend.
// most likely the same as the Post Request
export interface PostOverdueDeathsReply {
  data: OverdueDeaths;
}
