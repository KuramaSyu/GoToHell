import { create } from 'zustand';
import { GetSportsResponse } from '../models/Sport';
import multiplierData from '../utils/data/Multipliers.json';
import { Multiplier } from '../models/Preferences';
import {
  SearchEntry,
  SportEntry,
} from '../pages/MainPage/QuickActions/SearchEntry';

const data: GetSportsResponse = multiplierData;
interface SportResponseState {
  sportResponse: GetSportsResponse;
  setSportResponse: (sportResponse: GetSportsResponse) => void;
  emptySportsResponse: () => GetSportsResponse;
  getSportMultiplier: (sport: string) => Multiplier;
  getSportEntryMap: () => Map<string, SearchEntry>;
}

let sportEntryMap: Map<string, SearchEntry> | null = null;

export const useSportResponseStore = create<SportResponseState>((set) => ({
  sportResponse: multiplierData,

  setSportResponse: (sportResponse: GetSportsResponse) =>
    set({ sportResponse: sportResponse }),

  emptySportsResponse: () => {
    return { games: {}, sports: {} };
  },

  getSportMultiplier: (sport: string) => {
    const { sports } = useSportResponseStore.getState().sportResponse;
    if (sports === undefined) {
      return {
        game: null,
        multiplier: 1,
        sport: sport,
      };
    }
    const multiplier: Multiplier = {
      game: null,
      multiplier: sports[sport] ?? 1,
      sport: sport,
    };
    return multiplier;
  },

  getSportEntryMap: () => {
    if (
      sportEntryMap
      // && Array.from(sportEntryMap.keys()).length >=
      //   Object.keys(multiplierData.sports).length
    ) {
      return sportEntryMap;
    }
    sportEntryMap = Object.keys(multiplierData.sports)
      .map((s) => new SportEntry(s))
      .reduce((map, entry) => {
        return map.set(entry.name, entry);
      }, new Map<string, SearchEntry>());
    return sportEntryMap;
  },
}));
