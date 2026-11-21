import { BACKEND_BASE } from '../../statics';
import { useUserStore } from '../../userStore';
import { useEquipmentStore } from '../../zustand/EquipmentStore';
import { BasicApi } from './OverdueDeathsApi';
import {
  PatchEquipmentRequest,
  PostEquipmentRequest,
} from './requests/Equipment';
import {
  GetEquipmentReply,
  PostEquipmentReply,
} from './responses/Equipment';

/**
 * API wrapper for /api/user/{user_id}/equipment.
 *
 * All mutations refresh the equipment store so calculated usages stay up to
 * date without a separate query library.
 */
export class EquipmentApi extends BasicApi {
  private endpoint(userID: string): string {
    return `/api/user/${userID}/equipment`;
  }

  async get(userID?: string): Promise<GetEquipmentReply | null> {
    const user = useUserStore.getState().user;
    const id = userID ?? user?.id;
    if (!id) return null;

    const API_ENDPOINT = this.endpoint(id);
    try {
      const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
        credentials: 'include',
        method: 'GET',
      });
      const result = await response.json();
      if (response.ok) {
        const reply = result as GetEquipmentReply;
        useEquipmentStore.getState().setEquipment(reply.data);
        return reply;
      }
      this.logError(API_ENDPOINT, result);
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
    return null;
  }

  async create(
    payload: PostEquipmentRequest,
  ): Promise<PostEquipmentReply | null> {
    const user = useUserStore.getState().user;
    if (!user) return null;

    const API_ENDPOINT = this.endpoint(user.id);
    try {
      const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        await this.get(user.id);
        return result as PostEquipmentReply;
      }
      this.logError(API_ENDPOINT, result);
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
    return null;
  }

  async update(
    payload: PatchEquipmentRequest,
  ): Promise<PostEquipmentReply | null> {
    const user = useUserStore.getState().user;
    if (!user) return null;

    const API_ENDPOINT = this.endpoint(user.id);
    try {
      const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
        credentials: 'include',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        await this.get(user.id);
        return result as PostEquipmentReply;
      }
      this.logError(API_ENDPOINT, result);
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
    return null;
  }

  async linkSports(
    equipmentID: string,
    sportIDs: (string | number)[],
  ): Promise<boolean> {
    const user = useUserStore.getState().user;
    if (!user) return false;

    const API_ENDPOINT = `${this.endpoint(user.id)}/${equipmentID}/sports`;
    try {
      const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport_ids: sportIDs }),
      });
      const result = await response.json();
      if (response.ok) {
        await this.get(user.id);
        return true;
      }
      this.logError(API_ENDPOINT, result);
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
    return false;
  }

  async unlinkSport(
    equipmentID: string,
    sportID: string | number,
  ): Promise<boolean> {
    const user = useUserStore.getState().user;
    if (!user) return false;

    const API_ENDPOINT = `${this.endpoint(user.id)}/${equipmentID}/sports/${sportID}`;
    try {
      const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        await this.get(user.id);
        return true;
      }
      this.logError(API_ENDPOINT, result);
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
    return false;
  }

  async remove(equipmentID: string): Promise<boolean> {
    const user = useUserStore.getState().user;
    if (!user) return false;

    const API_ENDPOINT = `${this.endpoint(user.id)}/${equipmentID}`;
    try {
      const response = await fetch(`${BACKEND_BASE}${API_ENDPOINT}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        await this.get(user.id);
        return true;
      }
      this.logError(API_ENDPOINT, result);
    } catch (error) {
      this.logError(API_ENDPOINT, error);
      throw error;
    }
    return false;
  }
}

export default EquipmentApi;
