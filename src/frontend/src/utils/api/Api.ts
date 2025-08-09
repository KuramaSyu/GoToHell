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
import { GetOverdueDeathsReply } from './responses/OverdueDeaths';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';
import { PatchSportResponse, PostSportsResponse } from './responses/Sport';

export interface BackendApiInterface {}
export interface UserApiInterface {
  fetchTotalScore(): Promise<Response>;
  fetchUser(): Promise<Response>;
  fetchFriends(): Promise<FriendshipReply | null>;
  fetchRecentSports(
    userIds: string[],
    limit: number,
    zustand: RecentSportApi
  ): Promise<SportsApiResponse | null>;
  fetchYourRecentSports(): Promise<SportsApiResponse | null>;
  fetchAllRecentSports(): Promise<SportsApiResponse | null>;
  deleteRecord(id: number): Promise<SportsApiResponse | null>;
  postSports(
    sports: SportRow[],
    updateStores: boolean
  ): Promise<PostSportsResponse | null>;
  patchSport(
    id: number,
    kind: string,
    game: string,
    amount: number,
    updateStores?: boolean
  ): Promise<PatchSportResponse | null>;
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
      useUsersStore.getState().setFriendsLoaded();
      return reply;
    } else {
      // log error and return null
      this.logError(API_ENDPOINT, await result.json());
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
   * posts SportRow records to /api/sports
   *
   * @Note
   * sets the useTotalScoreStore Zustand
   *
   * @throws Error: if the fetch fails
   *
   * @param sports: SportRow[]: the sport records to post
   *
   * @returns
   * PostSportResponse | null: the Response
   */
  async postSports(
    sports: SportRow[],
    updateStores: boolean = false
  ): Promise<PostSportsResponse | null> {
    const API_ENDPOINT = '/api/sports';
    // get user
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(sports),
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const { setAmounts, amounts } = useTotalScoreStore.getState();

        var reply = result as PostSportsResponse;

        if (updateStores) {
          setAmounts([
            ...amounts.filter((a) => {
              return !reply.results.some((r) => r.kind === a.kind);
            }),
            ...reply.results,
          ]);
        }
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
  /**
   * patches a sport-record to /api/sports
   *
   * @Note
   * sets the useTotalScoreStore Zustand
   *
   * @throws Error: if the fetch fails
   *
   * @param sports: SportRow[]: the sport records to post
   *
   * @returns
   * PostSportResponse | null: the Response
   */
  async patchSport(
    id: number,
    kind: string | null,
    game: string | null,
    amount: number | null,
    updateStores?: boolean
  ): Promise<PatchSportResponse | null> {
    const API_ENDPOINT = '/api/sports';
    // get user
    const user = useUserStore.getState().user;
    if (user === null) {
      return null;
    }
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    var body = JSON.stringify({
      id: id,
      kind: kind,
      game: game,
      amount: amount,
    });

    console.log(`patch with ${body}`);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'PATCH',
        body: body,
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const { setRecentSports, recentSports, triggerRefresh } =
          useRecentSportsStore.getState();

        var reply = result as PatchSportResponse;
        console.log(`reply: ${JSON.stringify(reply)}`);

        if (updateStores && recentSports !== null) {
          setRecentSports({
            data: [
              ...recentSports.data.map((s) => {
                if (s.id !== id) return s;
                return {
                  ...s,
                  ...(kind !== null && { kind }),
                  ...(game !== null && { game }),
                  ...(amount !== null && { amount }),
                };
              }),
            ],
          });
          //triggerRefresh();
        }
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
