import { BACKEND_BASE } from '../statics';

class SportRow {
  kind: string;
  game: string;
  amount: number;

  constructor(kind: string, game: string, amount: number) {
    this.kind = kind;
    this.game = game;
    this.amount = amount;
  }

  equals(other: SportRow): boolean {
    return (
      this.kind === other.kind &&
      this.game === other.game &&
      this.amount === other.amount
    );
  }

  hash(): string {
    return `${this.kind};${this.game};${this.amount}`;
  }

  toJson(): string {
    const rounded = {
      ...this,
      amount: Math.round(this.amount),
    };
    return JSON.stringify([rounded]);
  }

  async upload(): Promise<Response> {
    const response = await fetch(`${BACKEND_BASE}/api/sports`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: this.toJson(),
    });
    return response;
  }
}

export interface SportScore {
  kind: string;
  amount: number;
}

export class SportAmountModel implements SportScore {
  kind: string;
  amount: number;

  constructor(kind: string, amount: number) {
    this.kind = kind;
    this.amount = amount;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export interface SportAmountResponse {
  result: SportScore;
}
export default SportRow;

// API Models
export interface GameDefinition {
  game: string;
  base_multiplier: number;
}

export interface SportDefinition {
  sport: string;
  base_multiplier: string;
}

export interface GetSportsResponse {
  sports: Record<string, number>;
  games: Record<string, number>;
}

export interface Sport {
  id: number;
  kind: string;
  amount: number;
  timedate: string;
  user_id: string;
  game: string;
}

export interface SportsApiResponse {
  data: Sport[];
}
