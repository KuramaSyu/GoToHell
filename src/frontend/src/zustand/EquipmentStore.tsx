import { create } from 'zustand';
import { EquipmentWithUsage } from '../utils/api/responses/Equipment';
import { getPreferredEquipment } from '../utils/data/Equipment';

interface EquipmentState {
  equipment: EquipmentWithUsage[];
  loaded: boolean;

  /**
   * Explicit selections per sport kind. A missing key means the user has not
   * selected anything for this sport yet, so the preferred equipment is used.
   * `null` explicitly means "no equipment".
   */
  selectionBySport: Record<string, string | null>;

  setEquipment: (equipment: EquipmentWithUsage[]) => void;
  invalidate: () => void;
  selectEquipment: (sport: string, equipmentID: string | null) => void;
}

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: [],
  loaded: false,
  selectionBySport: {},

  setEquipment: (equipment) => set({ equipment, loaded: true }),

  // Invalidating keeps the stale data visible (like react-query) while the
  // next component which needs the data fetches it again.
  invalidate: () => set({ loaded: false }),

  selectEquipment: (sport, equipmentID) =>
    set((state) => ({
      selectionBySport: {
        ...state.selectionBySport,
        [sport]: equipmentID,
      },
    })),
}));

export const getSelectedEquipment = (
  state: EquipmentState,
  sport: string | null | undefined,
): EquipmentWithUsage | null => {
  if (!sport) return null;
  const selection = state.selectionBySport[sport];
  if (selection !== undefined) {
    return state.equipment.find((item) => item.id === selection) ?? null;
  }
  return getPreferredEquipment(state.equipment, sport) ?? null;
};

export default useEquipmentStore;
