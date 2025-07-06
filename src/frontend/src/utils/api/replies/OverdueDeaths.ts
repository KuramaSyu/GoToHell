import { OverdueDeaths } from '../../../models/OverdueDeaths';

// interface for GET /overdue-deaths
export interface GetOverdueDeathsReply {
  data: OverdueDeaths[];
}
