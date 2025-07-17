import { StreakData } from '../../models/Streak';
import { BACKEND_BASE } from '../../statics';
import { useUsersStore, useUserStore } from '../../userStore';
import { useStreakStore } from '../../zustand/StreakStore';
import { BasicApi } from './OverdueDeathsApi';
import { GetStreakResponse } from './responses/Streak';

export class StreakApi extends BasicApi {
  /**
   * fetches Streak from the user who is logged in.
   *
   * @Note
   * sets the useStreakStore Zustand, if forUser = true, otherwise
   * it will set the streak for each friend inside useUsersStore Zustand
   *
   * @param user_ids: an array of user IDs to fetch streaks for
   * @param forUser: whether or not this request is just for the logged in user
   */
  async get(user_ids: string[]): Promise<GetStreakResponse | null> {
    const API_ENDPOINT = '/api/streak';

    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);
    url.searchParams.append('user_ids', user_ids.join(','));

    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
    });

    const result = await response.json();
    if (response.ok) {
      const reply = result as GetStreakResponse;
      const user = useUserStore.getState().user!;

      if (reply.data.some((x) => x.user_id === user.id)) {
        // reply contains the streak of the user

        // set user Streak zustand to streak
        // TODO: set user streak into useUserStore and remove streak store
        const setStreak = useStreakStore.getState().setStreak;

        setStreak(reply.data[0]!.days);

        const { user, setUser } = useUserStore.getState();
        user!.streak = reply.data[0]!.days;
        setUser(user);
      }

      if (!reply.data.every((x) => x.user_id === user.id)) {
        // reply contains other IDs then the one from the logged in user

        // update useUsersStore with each users streak
        const { users, addFriends } = useUsersStore.getState();

        reply.data.forEach((element) => {
          var u = users[element.user_id];
          if (u === undefined) return;
          u.streak = element.days;
          users[element.user_id] = u;
        });

        addFriends(Object.values(users));
      }

      return reply;
    } else {
      this.logError(API_ENDPOINT, result);
    }
    return null;
  }
}
