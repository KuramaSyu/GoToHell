import { create } from "zustand";

const themes = ["dark", "nord", "github"] as const;
type Theme = typeof themes[number];

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>(function (set) {
    return {
      theme: "dark",
      setTheme: function (theme) {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
    };
  });
  
