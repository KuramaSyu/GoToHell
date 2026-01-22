import { OverdueDeaths } from '../../models/OverdueDeaths';
import { BACKEND_BASE } from '../../statics';
import { useUserStore } from '../../userStore';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';
import {
  GetOverdueDeathsReply,
  PostOverdueDeathsReply,
} from './responses/OverdueDeaths';
import { PostOverdueDeathsRequest } from './requests/OverdueDeaths';
import { BasicApi } from './OverdueDeathsApi';

export class PersonalGoalsApi extends BasicApi {
  /**
   * posts an record of OverdueDeaths for logged in user
   * to /api/overdue-deaths POST
   *
   * @Note
   * updates the usePersonalGoalsStore Zustand for the posted personal goal
   *
   * @param game: the game name
   * @param count: the count of overdue deaths to add
   * @param incrementLogic: a callback function, for calculating the new count, using the current count and the passed count
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * PostOverdueDeathsReply | null: the Response or null if failed
   */
  async post(
    game: string,
    count: number,
    incrementLogic: (currentCount: number, count: number) => number = (
      currentCount,
      count,
    ) => currentCount + count,
    updateStores: boolean = true,
  ): Promise<PostOverdueDeathsReply | null> {
    return this.postPutPatchOverdueDeaths(
      game,
      count,
      incrementLogic,
      updateStores,
      'POST',
    );
  }

  /**
   * puts an record of OverdueDeaths for logged in user (which updates or creates it)
   * to /api/overdue-deaths PUT
   *
   * @Note
   * updates the useOverdueDeathsStore Zustand for the posted game
   *
   * @param game: the game name
   * @param count: the count of overdue deaths to add
   * @param incrementLogic: a callback function, for calculating the new count, using the current count and the passed count
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * PostOverdueDeathsReply | null: the Response or null if failed
   */
  async put(
    game: string,
    count: number,
    incrementLogic: (currentCount: number, count: number) => number = (
      currentCount,
      count,
    ) => currentCount + count,
    updateStores: boolean = true,
  ): Promise<PostOverdueDeathsReply | null> {
    return this.postPutPatchOverdueDeaths(
      game,
      count,
      incrementLogic,
      updateStores,
      'PUT',
    );
  }

  private async postPutPatchOverdueDeaths(
    game: string,
    count: number,
    incrementLogic: (currentCount: number, count: number) => number = (
      currentCount,
      count,
    ) => currentCount + count,
    updateStores: boolean = true,
    method: 'POST' | 'PUT' | 'PATCH',
  ): Promise<PostOverdueDeathsReply | null> {
    const API_ENDPOINT = '/api/overdue-deaths';
    // get user
    const user = useUserStore.getState().user;

    if (user === null) {
      return null;
    }
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    // check current count or 0 if not found
    const currentCount =
      useOverdueDeathsStore
        .getState()
        .overdueDeathsList.find((x) => x.game === game)?.count || 0;

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: method,
        body: JSON.stringify({
          game: game,
          count: incrementLogic(currentCount, count),
        } as PostOverdueDeathsRequest),
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const setOverdueDeaths =
          useOverdueDeathsStore.getState().setOverdueDeaths;

        // cast result
        var reply = result as PostOverdueDeathsReply;

        if (updateStores) {
          // update zustand for the new game
          const prev = useOverdueDeathsStore.getState().overdueDeathsList;
          setOverdueDeaths([
            ...prev.filter((p) => p.game !== reply.data.game),
            reply.data,
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
