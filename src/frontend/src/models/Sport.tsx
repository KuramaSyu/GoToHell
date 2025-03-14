import { BACKEND_BASE } from "../statics";

class SportRow {
    kind: string;
    game: string;
    amount: number;

    constructor(kind: string, game: string, amount: number) {
        this.kind = kind;
        this.game = game;
        this.amount = amount
    }

    toJson(): string {
        return JSON.stringify([this]);
    }

    async upload(): Promise<Response> {
        const response = await fetch(`${BACKEND_BASE}/api/sports`, {
            credentials: 'include',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: this.toJson()
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