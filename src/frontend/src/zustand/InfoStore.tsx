import { create } from 'zustand';

export interface SnackbarUpdate {
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export class SnackbarUpdateImpl implements SnackbarUpdate {
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  duration?: number;

  constructor(
    message: string,
    severity?: 'success' | 'info' | 'warning' | 'error',
    duration?: number
  ) {
    this.message = message;
    this.severity = severity ?? 'info';
    this.duration = duration ?? this.geDefaultDuration();
  }

  getDurationMs(): number {
    return (this.duration ?? this.geDefaultDuration()) * 1000;
  }

  geDefaultDuration(): number {
    if (this.severity === 'info') {
      return 5;
    } else if (this.severity === 'warning' || this.severity === 'error') {
      return 6;
    } else {
      return 4;
    }
  }
}

interface AppState {
  Message: SnackbarUpdateImpl;
  setMessage: (message: SnackbarUpdateImpl) => void;
}

const useInfoStore = create<AppState>((set) => ({
  Message: new SnackbarUpdateImpl(''),
  setMessage: (message) => set({ Message: message }),
}));

export default useInfoStore;
