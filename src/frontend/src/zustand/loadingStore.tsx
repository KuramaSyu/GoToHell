import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: true,
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
