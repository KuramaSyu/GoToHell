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
import { GetPersonalGoalsReply } from './responses/PersonalGoals';
import { usePersonalGoalsStore } from '../../zustand/PersonalGoalsStore';
import { PostPutPatchPersonalGoalsRequest } from './requests/PersonalGoals';

/**
 * The API Wrapper for /api/{user_id}/goals
 * to modify Personal Goals.
 */
export class PersonalGoalApi extends BasicApi {
  /**
   * posts an record of PersonalGoals for logged in user
   * to /api/{user_id}/goals POST
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
    sport: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly',
    updateStores: boolean = true,
  ): Promise<GetPersonalGoalsReply | null> {
    return this.postPutPatchPersonalGoals(
      sport,
      amount,
      frequency,
      'POST',
      undefined,
      true,
    );
  }

  /**
   * puts an record of PersonalGoalsData for logged in user (which updates or creates it)
   * to /api/{user_id}/goals PUT
   *
   * @Note
   * updates the usePersonalGoalsStore Zustand for the posted game
   *
   * @param sport: the sport name
   * @param amount: the amount of exercises of sport
   * @param frequency: in which frequency the goal should be achieved
   * @throws Error: if the fetch fails
   *
   * @returns
   * GetPersonalGoalsReply | null: the Response or null if failed
   */
  async put(
    id: string,
    sport: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly',
    updateStores: boolean = true,
  ): Promise<GetPersonalGoalsReply | null> {
    return this.postPutPatchPersonalGoals(
      sport,
      amount,
      frequency,
      'PUT',
      id,
      updateStores,
    );
  }

  /**
   * deletes a PersonalGoal record for the logged in user
   * to /api/{user_id}/goals DELETE
   *
   * @Note
   * updates the usePersonalGoalsStore Zustand to remove the deleted personal goal
   *
   * @param id: the id of the personal goal to delete
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * boolean: true if successful, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    // get user
    const user = useUserStore.getState().user;

    if (user === null) {
      return false;
    }

    const API_ENDPOINT = `/api/${user.id}/goals`;
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'DELETE',
        body: JSON.stringify({ id: id }),
      });

      if (response.ok) {
        // get zustand setter
        const setter = usePersonalGoalsStore.getState().setPersonalGoals;

        // update zustand by removing the deleted goal
        setter(
          usePersonalGoalsStore
            .getState()
            .personalGoalsList.filter((g) => g.id !== id),
        );

        return true;
      } else {
        const result = await response.json();
        this.logError(API_ENDPOINT, result);
      }
      return false;
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
  }

  private async postPutPatchPersonalGoals(
    sport: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly',
    method: 'POST' | 'PUT' | 'PATCH',
    id: string | undefined = undefined,
    updateStores: boolean = true,
  ): Promise<GetPersonalGoalsReply | null> {
    // get user
    const user = useUserStore.getState().user;

    if (user === null) {
      return null;
    }

    const API_ENDPOINT = `/api/${user.id}/goals`;
    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: method,
        body: JSON.stringify({
          sport: sport,
          amount: amount,
          frequency: frequency,
          id: id,
        } as PostPutPatchPersonalGoalsRequest),
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const setter = usePersonalGoalsStore.getState().setPersonalGoals;

        // cast result
        var reply = result as GetPersonalGoalsReply;

        if (updateStores) {
          // update zustand for the new game
          setter([
            ...usePersonalGoalsStore
              .getState()
              .personalGoalsList.filter((g) => g.id !== reply.data[0]?.id),
            ...reply.data,
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
   * fetches PersonalGoals for the selected user
   * from /api/{user_id}/goals GET
   *
   * @Note
   * sets the usePersonalGoalsStore Zustand
   *
   * @throws Error: if the fetch fails
   *
   * @returns
   * GetPersonalGoalsReply | null: the Response or null if failed
   */
  async get(user_id: string): Promise<GetPersonalGoalsReply | null> {
    const API_ENDPOINT = `/api/${user_id}/goals`;

    const url = new URL(`${BACKEND_BASE}${API_ENDPOINT}`);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
      });

      const result = await response.json();
      if (response.ok) {
        // get zustand setter
        const setPersonalGoals =
          usePersonalGoalsStore.getState().setPersonalGoals;

        // cast result
        var reply = result as GetPersonalGoalsReply;

        // set zustand
        setPersonalGoals(reply.data);

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
