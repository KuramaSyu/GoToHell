import { OverdueDeaths } from '../../models/OverdueDeaths';
import { BACKEND_BASE } from '../../statics';
import { useUserStore } from '../../userStore';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';
import {
  GetOverdueDeathsReply,
  PostOverdueDeathsReply,
} from './responses/OverdueDeaths';
import { PostOverdueDeathsRequest } from './requests/OverdueDeaths';

// implements logError
export abstract class BasicApi {
  // represents the backend methods, which are needed for user purposes
  logError(url_part: string, error: any): void {
    console.error(
      `Error fetching ${BACKEND_BASE}${url_part}:`,
      JSON.stringify(error)
    );
  }
}
export class OverdueDeathsApi extends BasicApi {
  /**
   * posts an record of OverdueDeaths for logged in user
   * to /api/overdue-deaths POST
   *
   * @Note
   * updates the useOverdueDeathsStore Zustand for the posted game
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * PostOverdueDeathsReply | null: the Response or null if failed
   */
  async post(
    game: string,
    count: number
  ): Promise<PostOverdueDeathsReply | null> {
    return this.postPutPatchOverdueDeaths(game, count, 'POST');
  }

  /**
   * puts an record of OverdueDeaths for logged in user (which updates or creates it)
   * to /api/overdue-deaths PUT
   *
   * @Note
   * updates the useOverdueDeathsStore Zustand for the posted game
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * PostOverdueDeathsReply | null: the Response or null if failed
   */
  async put(
    game: string,
    count: number
  ): Promise<PostOverdueDeathsReply | null> {
    return this.postPutPatchOverdueDeaths(game, count, 'PUT');
  }

  private async postPutPatchOverdueDeaths(
    game: string,
    count: number,
    method: 'POST' | 'PUT' | 'PATCH'
  ): Promise<PostOverdueDeathsReply | null> {
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
        method: method,
        body: JSON.stringify({
          game: game,
          count: count,
        } as PostOverdueDeathsRequest),
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const setOverdueDeaths =
          useOverdueDeathsStore.getState().setOverdueDeaths;

        // cast result
        var reply = result as PostOverdueDeathsReply;

        // update zustand for the new game
        const prev = useOverdueDeathsStore.getState().overdueDeathsList;
        setOverdueDeaths([
          ...prev.filter((p) => p.game !== reply.data.game),
          reply.data,
        ]);

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
  async get(): Promise<GetOverdueDeathsReply | null> {
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
