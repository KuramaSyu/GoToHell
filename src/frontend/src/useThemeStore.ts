// useThemeStore.ts
import { create } from 'zustand';

type ThemeName = 'light' | 'dark' | 'nord' | 'github';

interface ThemeState {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'dark',
  setTheme: (theme: ThemeName) => set({ currentTheme: theme }),
}));
