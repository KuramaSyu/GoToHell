import { create } from 'zustand';

interface AppState {
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

const useAppState = create<AppState>((set) => ({
  errorMessage: '',
  setErrorMessage: (message) => set({ errorMessage: message }),
}));

export default useAppState;
