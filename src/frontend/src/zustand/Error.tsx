import { create } from 'zustand';

interface AppState {
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

const useErrorStore = create<AppState>((set) => ({
  errorMessage: '',
  setErrorMessage: (message) => set({ errorMessage: message }),
}));

export default useErrorStore;
