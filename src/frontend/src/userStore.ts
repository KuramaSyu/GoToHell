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
  friendsLoaded: boolean;

  /**
   * appends a user to the existing ones
   * @param user - the user to add
   * @returns
   */
  addUser: (user: DiscordUserImpl) => void;

  /**
   * extends a dict of users where existing users will be overridden with new ones
   * @param users - the users to add
   * @returns
   */
  addFriends: (users: DiscordUserImpl[]) => void;

  /**
   * removes a user from the dict
   * @param id - the id of the user to remove
   * @returns
   */
  removeUser: (id: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: {},
  friendsLoaded: false,
  addUser: (user: DiscordUserImpl) =>
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    })),
  addFriends: (users: DiscordUserImpl[]) =>
    set((state) => ({
      users: users.reduce<Record<string, DiscordUserImpl>>(
        (acc, user) => {
          acc[user.id] = user;
          return acc;
        },
        { ...state.users }
      ),
      friendsLoaded: true,
    })),
  removeUser: (id: string) =>
    set((state) => {
      const updatedUsers = { ...state.users };
      delete updatedUsers[id];
      return { users: updatedUsers };
    }),
}));
