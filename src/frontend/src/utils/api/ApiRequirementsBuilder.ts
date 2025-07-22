import { FriendshipReply } from '../../pages/friends/FriendOverview';
import { useUsersStore, useUserStore } from '../../userStore';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useStreakStore } from '../../zustand/StreakStore';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { loadPreferencesFromCookie } from '../cookiePreferences';
import { UserApi } from './Api';
import { OverdueDeathsApi } from './OverdueDeathsApi';
import { StreakApi } from './StreakApi';

interface IApiReuqirement {
  needsFetch(): Boolean;
  fetchPredicate(): Boolean;
  fetch(): Promise<void>;
  fetchIfNeeded(): Promise<void>;
  getPriority(): number;
}

abstract class ApiRequirementABC implements IApiReuqirement {
  private static instances = new Map<string, ApiRequirementABC>();

  protected hasFetched = false;
  protected fetchPromise: Promise<void> | null = null;
  protected lastResult: any = null;

  constructor() {}

  static getInstance<T extends ApiRequirementABC>(this: new () => T): T {
    const className = this.name;
    if (!ApiRequirementABC.instances.has(className)) {
      ApiRequirementABC.instances.set(
        className,
        new this() as ApiRequirementABC
      );
    }
    return ApiRequirementABC.instances.get(className) as T;
  }

  needsFetch(): boolean {
    return !this.hasFetched;
  }
  abstract fetchPredicate(): Boolean;

  async fetch(): Promise<void> {
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = (async () => {
      try {
        this.lastResult = await this.doFetch();
        this.hasFetched = true;
      } finally {
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
  }

  getLastResult(): any {
    return this.lastResult;
  }

  async fetchIfNeeded(): Promise<void> {
    if (this.needsFetch()) {
      await this.fetch();
    }
  }

  protected abstract doFetch(): Promise<any>;

  getPriority(): number {
    return 1;
  }
}

/**
 * tries to authenticate a user by coockie.
 * It sets `useUserStore` to the authenticated user
 * */
export class UserRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(`DEBUG: Checking if user needs fetch`);
    return useUserStore.getState().user === null;
  }

  async doFetch(): Promise<void> {
    console.log(`DEBUG: Fetching user data`);
    await new UserApi().fetchUser();
  }

  getPriority(): number {
    return 0; // User requirement has the highest priority
  }
}

/**
 * fetches the total scores (the scores, which sum up all sport activities) for a user
 * */
export class TotalScoreRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(`DEBUG: Checking if total scores need fetch`);
    return useTotalScoreStore.getState().amounts.length === 0;
  }

  async doFetch(): Promise<void> {
    console.log(`DEBUG: Fetching total scores`);
    await new UserApi().fetchTotalScore();
  }
}

/**
 * This fetches all friendships and adds these users to the useUsersStore.
 * It returns the friendshipreply
 */
export class FriendsRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(
      `DEBUG: Checking if friends need fetch: ${
        useUsersStore.getState().friendsLoaded === false
      }`
    );
    return useUsersStore.getState().friendsLoaded === false;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Fetching friends data`);
    return await new UserApi().fetchFriends();
  }

  /**
   * is set to 1, since it needs to be fetched before AllStreaksRequirement
   * @returns 1
   */
  getPriority(): number {
    return 1;
  }
}

/**
 * fetches Streak from the user who is logged in.
 *
 * @Note
 * sets the useStreakStore Zustand
 */
export class YourStreakRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    const fetchPredicate = useStreakStore.getState().streak === null;
    console.log(`DEBUG: Checking if streak needs fetch:  ${fetchPredicate}`);
    return fetchPredicate;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Fetching streak data`);
    return await new StreakApi().get([useUserStore.getState().user!.id]);
  }
}

/**
 * fetches Streak from the user who is logged in.
 *
 * @Note
 * sets the useStreakStore Zustand, useUserStore and useUsersStore
 */
export class AllStreaksRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    const isUserStreakNull = useUserStore.getState().user?.streak === null;
    const isAnyFriendStreakNull = Object.values(
      useUsersStore.getState().users
    ).some((u) => u.streak === null);
    const fetchPredicate = isUserStreakNull || isAnyFriendStreakNull;
    console.log(
      `DEBUG: Checking if any streak needs fetch:  ${fetchPredicate}`
    );
    return fetchPredicate;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Fetching all streaks data`);
    const userId = useUserStore.getState().user!.id;
    const friendIds = Object.values(useUsersStore.getState().users).map(
      (u) => u.id
    );
    return await new StreakApi().get([userId, ...friendIds]);
  }

  /**
   * is set to 2, so that Friends and user fetched before it.
   * @returns 2
   */
  getPriority(): number {
    return 2;
  }
}

/**
 * fetches Recent Sports for userIds
 *
 * @Note
 * sets the useRecentSportsStore Zustand
 * FriendsRequirement should be loaded before
 */
export class AllRecentSportsRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(`DEBUG: Checking if recent sports need fetch`);
    return useRecentSportsStore.getState().recentSports === null;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Fetching all recent sports`);
    await new FriendsRequirement().fetchIfNeeded();
    return await new UserApi().fetchAllRecentSports();
  }
}

/**
 * fetches the users Recent Sports
 *
 * @Note
 * sets the useYourRecentSportsStore Zustand
 */
export class YourRecentSportsRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(`DEBUG: Checking if your recent sports need fetch`);
    return useRecentSportsStore.getState().recentSports === null;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Fetching your recent sports`);
    return await new UserApi().fetchYourRecentSports();
  }
}

/**
 * fetches the users OverdueDeaths
 *
 * @Note
 * sets the useOverdueDeathsStore Zustand
 */
export class OverdueDeathsRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(`DEBUG: Checking for overdueDeaths`);
    return useOverdueDeathsStore.getState().loaded === false;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Fetching OverdueDeaths`);
    return await new OverdueDeathsApi().get();
  }
}

/**
 * reads the preferences out of the cookie
 *
 * @Note
 * updates the usePreferenceStore
 */
export class PreferencesRequirement extends ApiRequirementABC {
  fetchPredicate(): Boolean {
    console.log(`DEBUG: Checking if preferences need fetch`);
    return usePreferenceStore.getState().preferencesLoaded === false;
  }

  async doFetch(): Promise<any> {
    console.log(`DEBUG: Loading preferences from cookie`);
    loadPreferencesFromCookie();
  }

  getPriority(): number {
    return 0; // most important. Even works if user is not logged in
  }
}

export enum ApiRequirement {
  User,
  TotalScore,
  Friends,
  Streak,
  AllStreaks,
  AllRecentSports,
  YourRecentSports,
  Preferences,
  OverdueDeaths,
}

export namespace ApiRequirement {
  export function toRequirement(req: ApiRequirement): IApiReuqirement {
    switch (req) {
      case ApiRequirement.User:
        return UserRequirement.getInstance();
      case ApiRequirement.TotalScore:
        return TotalScoreRequirement.getInstance();
      case ApiRequirement.Friends:
        return FriendsRequirement.getInstance();
      case ApiRequirement.Streak:
        return YourStreakRequirement.getInstance();
      case ApiRequirement.AllRecentSports:
        return AllRecentSportsRequirement.getInstance();
      case ApiRequirement.YourRecentSports:
        return YourRecentSportsRequirement.getInstance();
      case ApiRequirement.Preferences:
        return PreferencesRequirement.getInstance();
      case ApiRequirement.OverdueDeaths:
        return OverdueDeathsRequirement.getInstance();
      case ApiRequirement.AllStreaks:
        return AllStreaksRequirement.getInstance();
      default:
        throw new Error(`Unknown ApiRequirement: ${req}`);
    }
  }
}

/**
 * Class, to set, which API data is needed. This data is
 * fetched, in case it's null/undefined. Otherwise it will
 * ignore it. => It acts as assertion, that some responses are present
 */
export class ApiRequirementsBuilder {
  requirements: IApiReuqirement[];

  constructor() {
    this.requirements = [];
  }

  add(requirement: ApiRequirement): ApiRequirementsBuilder {
    this.requirements.push(ApiRequirement.toRequirement(requirement));
    return this;
  }

  async forceFetch(): Promise<void> {
    var promises: Promise<void>[] = [];
    for (let requirement of this.requirements) {
      promises.push(requirement.fetch());
    }

    await Promise.all(promises);
  }

  async fetchIfNeeded(): Promise<void> {
    var requirements: IApiReuqirement[][] = [[], [], []];
    for (let requirement of this.requirements) {
      requirements[requirement.getPriority()]?.push(requirement);
    }
    for (let requirementList of requirements) {
      var promises: Promise<void>[] = [];
      for (let requirement of requirementList) {
        promises.push(requirement.fetchIfNeeded());
      }
      await Promise.all(promises);
    }
  }
}
