// interface for GET /overdue-deaths
export interface GetOverdueDeathsReply {
  data: OverdueDeaths[];
}

// one record of OverdueDeaths containing the user_id, the game and it's belonging count
export interface OverdueDeaths {
  user_id: string;
  game: string;
  count: number;
}
