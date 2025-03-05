import { create } from 'zustand';
import { themes } from './themes';

type ThemeName = 'light' | 'dark' | 'nord' | 'github';

interface ThemeState {
  currentTheme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'dark',
  setTheme: (theme: string) => {
    const keys = Object.keys(themes);
    if (keys.includes(theme)) {
      set({ currentTheme: theme })
    } else {
      set({ currentTheme: 'dark' })
    }
  },
}));
