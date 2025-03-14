import {create} from 'zustand';
import { SportScore } from '../models/Sport';


interface TotalAmountState {
    amounts: SportScore[];
    setAmounts: (amounts: SportScore[]) => void;
    addAmount: (amount: SportScore) => void;
    resetAmounts: () => void;
}

export const useTotalScoreStore = create<TotalAmountState>((set) => ({
    amounts: [],
    setAmounts: (amounts: SportScore[]) => set({ amounts }),
    addAmount: (amount: SportScore) =>
        set((state) => ({ amounts: [...state.amounts, amount] })),
    resetAmounts: () => set({ amounts: [] }),
}));