import { J } from 'framer-motion/dist/types.d-6pKw1mTI';
import { SportScore } from '../../models/Sport';
import { BACKEND_BASE } from '../../statics';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { DiscordUser, DiscordUserImpl } from '../../components/DiscordLogin';
import { useUserStore } from '../../userStore';

export interface BackendApiInterface {}
export interface UserApiInterface {
  fetchTotalScore(): Promise<Response>;
  fetchUser(): Promise<Response>;
}

// Class, to fetch resources from the backend. Responses will be
// set with the Zustand setters
export class DefaultBackendApi implements BackendApiInterface {}

// represents the backend methods, which are needed for user purposes
export class UserApi implements UserApiInterface {
  logError(url: string, error: any): void {
    console.error(`Error fetching ${url}:`, JSON.stringify(error));
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
      this.logError(`${BACKEND_BASE}/api/sports/total`, fut.json());
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
      this.logError(`${BACKEND_BASE}/api/auth/user`, response.json());
    }
    return response;
  }
}
