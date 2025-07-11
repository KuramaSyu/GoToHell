import SportRow, { SportsApiResponse, SportScore } from '../../models/Sport';
import { BACKEND_BASE } from '../../statics';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { DiscordUser, DiscordUserImpl } from '../../components/DiscordLogin';
import { useUsersStore, useUserStore } from '../../userStore';
import { FriendshipReply } from '../../pages/friends/FriendOverview';
import { StreakData } from '../../models/Streak';
import { useStreakStore } from '../../zustand/StreakStore';
import {
  RecentSportApi,
  useRecentSportsStore,
  useYourRecentSportsStore,
} from '../../zustand/RecentSportsState';
import { GetOverdueDeathsReply } from './replies/OverdueDeaths';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';

export interface BackendApiInterface {}
export interface UserApiInterface {
  fetchTotalScore(): Promise<Response>;
  fetchUser(): Promise<Response>;
  fetchFriends(): Promise<FriendshipReply | null>;
  fetchStreak(): Promise<StreakData | null>;
  fetchRecentSports(
    user_ids: string[],
    limit: number,
    zustand: RecentSportApi
  ): Promise<SportsApiResponse | null>;
  fetchYourRecentSports(): Promise<SportsApiResponse | null>;
  fetchAllRecentSports(): Promise<SportsApiResponse | null>;
  deleteRecord(id: number);
  postSports(sports: SportRow[]): Promise<PostSportsApiResponse | null>;
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
      const addFriends = useUsersStore.getState().addFriends;
      const reply = result['data'] as FriendshipReply;
      addFriends(reply.users.map((user) => new DiscordUserImpl(user)));
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
   *
   * @throws Error: if the fetch fails
   *
   * @param userIds: string[]: the user ids to fetch sports for
   * @param limit: number | undefined: the limit of sports to fetch, defaults to 50
   *
   * @returns
   * SportsApiResponse | null: the Response (already sorted), or null if failed
   */
  async fetchRecentSports(
    userIds: string[],
    limit: number | undefined,
    zustand: RecentSportApi
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

    try {
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
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
  }

  async fetchYourRecentSports(): Promise<SportsApiResponse | null> {
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    return this.fetchRecentSports([user.id], 25, useYourRecentSportsStore);
  }

  async fetchAllRecentSports(): Promise<SportsApiResponse | null> {
    const users = useUsersStore.getState().users;
    if (useUsersStore.getState().friendsLoaded === false) {
      return null;
    }
    return this.fetchRecentSports(
      Object.values(users).map((u) => u.id),
      50,
      useRecentSportsStore
    );
  }

  /**
   * Deletes a Sport Record
   */
  async deleteRecord(id: number): Promise<SportsApiResponse | null> {
    const API_ENDPOINT = '/api/sports/';
    // get user
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}${id}`, {
      credentials: 'include',
      method: 'DELETE',
    });

    const result = await response.json();
    if (response.ok) {
      const reply: SportsApiResponse = result.data;
      return reply;
    } else {
      this.logError(API_ENDPOINT, result);
    }
    return null;
  }

  /**
   * fetches OverdueDeaths for logged in user
   * from /api/overdue-deaths GET
   *
   * @Note
   * sets the useOverdueDeathsStore Zustand
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * GetOverdueDeathsReply | null: the Response or null if failed
   */
  async getOverdueDeaths(): Promise<GetOverdueDeathsReply | null> {
    const API_ENDPOINT = '/api/overdue-deaths';
    // get user
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const setOverdueDeaths =
          useOverdueDeathsStore.getState().setOverdueDeaths;

        // cast result
        var reply = result as GetOverdueDeathsReply;

        // set zustand
        setOverdueDeaths(reply.data);

        return reply;
      } else {
        this.logError(API_ENDPOINT, result);
      }
      return null;
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
  }
}
