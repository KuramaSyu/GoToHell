import { J } from 'framer-motion/dist/types.d-6pKw1mTI';
import {
  GetSportsResponse,
  SportsApiResponse,
  SportScore,
} from '../../models/Sport';
import { BACKEND_BASE } from '../../statics';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { DiscordUser, DiscordUserImpl } from '../../components/DiscordLogin';
import { useUsersStore, useUserStore } from '../../userStore';
import { FriendshipReply } from '../../pages/friends/FriendOverview';
import { StreakData } from '../../models/Streak';
import { useStreakStore } from '../../zustand/StreakStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';

export interface BackendApiInterface {}
export interface UserApiInterface {
  fetchTotalScore(): Promise<Response>;
  fetchUser(): Promise<Response>;
  fetchFriends(): Promise<FriendshipReply | null>;
  fetchStreak(): Promise<StreakData | null>;
  fetchRecentSports(
    user_ids: string[],
    limit: number
  ): Promise<SportsApiResponse | null>;
}
export interface SportApiInterface {
  fetchDefault(): Promise<GetSportsResponse | null>;
}
// Class, to fetch resources from the backend. Responses will be
// set with the Zustand setters
export class DefaultBackendApi implements BackendApiInterface {}

// represents the backend methods, which are needed for user purposes
export class UserApi implements UserApiInterface {
  logError(url_part: string, error: any): void {
    console.error(
      `Error fetching ${BACKEND_BASE}${url_part}:`,
      JSON.stringify(error)
    );
  }

  /**
   * fetches the total scores (the scores, which sum up all sport activities) for a user
   * */
  async fetchTotalScore(): Promise<Response> {
    // short bind for zustand
    const setAmounts = useTotalScoreStore.getState().setAmounts;

    // credentials include, who the user is
    const fut = await fetch(`${BACKEND_BASE}/api/sports/total`, {
      credentials: 'include',
    });
    if (fut.ok) {
      const parsed_data: { results?: SportScore[] } = await fut.json();
      if (parsed_data.results) {
        setAmounts(parsed_data.results);
      }
    } else {
      this.logError(`/api/sports/total`, fut.json());
    }
    return fut;
  }

  /**
   * tries to authenticate a user by coockie.
   * It sets `useUserStore` to the authenticated user
   * */
  async fetchUser(): Promise<Response> {
    const setUser = useUserStore.getState().setUser;
    const response = await fetch(`${BACKEND_BASE}/api/auth/user`, {
      credentials: 'include',
    });

    if (response.ok) {
      const userData: DiscordUser = await response.json();
      setUser(new DiscordUserImpl(userData));
    } else {
      this.logError(`/api/auth/user`, response.json());
    }
    return response;
  }

  /**
   * This fetches all friendships and adds these users to the useUsersStore.
   * It returns the friendshipreply
   */
  async fetchFriends(): Promise<FriendshipReply | null> {
    const API_ENDPOINT = '/api/friends';
    const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
      credentials: 'include',
    });
    const result = await response.json();
    if (response.ok) {
      // set zustand store and return reply
      const addUser = useUsersStore.getState().addUser;
      const reply = result['data'] as FriendshipReply;
      reply.users.forEach((friend) => {
        addUser(new DiscordUserImpl(friend));
      });
      return reply;
    } else {
      // log error and return null
      this.logError(API_ENDPOINT, await result.json());
    }
    return null;
  }

  /**
   * fetches Streak from the user who is logged in.
   *
   * @Note
   * sets the useStreakStore Zustand
   */
  async fetchStreak(): Promise<StreakData | null> {
    const API_ENDPOINT = '/api/sports/streak/';
    // get user
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}${user.id}`, {
      credentials: 'include',
      method: 'GET',
    });

    const result = await response.json();
    if (response.ok) {
      // get zustand setter
      const setStreak = useStreakStore.getState().setStreak;

      const reply = result['data'] as StreakData;
      setStreak(reply.days);
      return reply;
    } else {
      this.logError(API_ENDPOINT, result);
    }
    return null;
  }

  /**
   * fetches Recent Sports for userIds
   *
   * @Note
   * sets the useRecentSportsStore Zustand
   */
  async fetchRecentSports(
    userIds: string[],
    limit: number | undefined
  ): Promise<SportsApiResponse | null> {
    limit = limit ?? 50;
    const API_ENDPOINT = '/api/sports';
    // get user
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);
    url.searchParams.append('user_ids', userIds.join(','));
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url, {
      credentials: 'include',
      method: 'GET',
    });

    const result = await response.json();
    if (response.ok) {
      // get zustand setter
      const setRecentSports = useRecentSportsStore.getState().setRecentSports;

      var reply = result as SportsApiResponse;
      reply.data.sort(
        (a, b) =>
          new Date(a.timedate).getTime() - new Date(b.timedate).getTime()
      );

      setRecentSports(reply);
      return reply;
    } else {
      this.logError(API_ENDPOINT, result);
    }
    return null;
  }
}
