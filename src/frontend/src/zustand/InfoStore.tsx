import { create } from 'zustand';

export interface SnackbarUpdate {
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface AppState {
  Message: SnackbarUpdate;
  setMessage: (message: SnackbarUpdate) => void;
}

const useInfoStore = create<AppState>((set) => ({
  Message: { message: '', severity: 'info' },
  setMessage: (message) => set({ Message: message }),
}));

export default useInfoStore;
