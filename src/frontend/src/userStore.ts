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

export interface UsersState {
  users: Record<string, DiscordUserImpl>;
  addUser: (user: DiscordUserImpl) => void;
  removeUser: (id: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: {},
  addUser: (user: DiscordUserImpl) =>
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    })),
  removeUser: (id: string) =>
    set((state) => {
      const updatedUsers = { ...state.users };
      delete updatedUsers[id];
      return { users: updatedUsers };
    }),
}));
