import { create } from 'zustand';
import { DiscordUserImpl } from './components/DiscordLogin';

interface UserState {
  user: DiscordUserImpl | null;
  setUser: (user: DiscordUserImpl | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: DiscordUserImpl | null) => set({ user: user }),
}));
