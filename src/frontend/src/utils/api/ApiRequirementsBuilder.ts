import { useUsersStore, useUserStore } from '../../userStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useStreakStore } from '../../zustand/StreakStore';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { UserApi } from './Api';

interface IApiReuqirement {
  needsFetch(): Boolean;
  fetch(): Promise<void>;
  fetchIfNeeded(): Promise<void>;
  getPriority(): number;
}

abstract class ApiRequirementABC implements IApiReuqirement {
  abstract needsFetch(): Boolean;
  abstract fetch(): Promise<void>;
  async fetchIfNeeded(): Promise<void> {
    if (this.needsFetch()) {
      await this.fetch();
    }
  }
  getPriority(): number {
    return 1;
  }
}

/**
 * tries to authenticate a user by coockie.
 * It sets `useUserStore` to the authenticated user
 * */
export class UserRequirement extends ApiRequirementABC {
  needsFetch(): Boolean {
    return useUserStore.getState().user === null;
  }

  async fetch(): Promise<void> {
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
  needsFetch(): Boolean {
    return useTotalScoreStore.getState().amounts.length === 0;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchTotalScore();
  }
}

/**
 * This fetches all friendships and adds these users to the useUsersStore.
 * It returns the friendshipreply
 */
export class FriendsRquirement extends ApiRequirementABC {
  needsFetch(): Boolean {
    return useUsersStore.getState().friendsLoaded === false;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchFriends();
  }
}

/**
 * fetches Streak from the user who is logged in.
 *
 * @Note
 * sets the useStreakStore Zustand
 */
export class StreakRequirement extends ApiRequirementABC {
  needsFetch(): Boolean {
    const needsFetch = useStreakStore.getState().streak === null;
    console.log(`Checking if streak needs fetch:  ${needsFetch}`);
    return needsFetch;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchStreak();
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
  needsFetch(): Boolean {
    return useRecentSportsStore.getState().recentSports === null;
  }

  async fetch(): Promise<void> {
    await new FriendsRquirement().fetchIfNeeded();
    await new UserApi().fetchAllRecentSports();
  }
}

/**
 * fetches the users Recent Sports
 *
 * @Note
 * sets the useYourRecentSportsStore Zustand
 */
export class YourRecentSportsRequirement extends ApiRequirementABC {
  needsFetch(): Boolean {
    return useRecentSportsStore.getState().recentSports === null;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchYourRecentSports();
  }
}

export enum ApiRequirement {
  User = 0,
  TotalScore = 1,
  Friends = 2,
  Streak = 3,
  AllRecentSports = 4,
  YourRecentSports = 5,
}

export namespace ApiRequirement {
  export function toRequirement(req: ApiRequirement): IApiReuqirement {
    switch (req) {
      case ApiRequirement.User:
        return new UserRequirement();
      case ApiRequirement.TotalScore:
        return new TotalScoreRequirement();
      case ApiRequirement.Friends:
        return new FriendsRquirement();
      case ApiRequirement.Streak:
        return new StreakRequirement();
      case ApiRequirement.AllRecentSports:
        return new AllRecentSportsRequirement();
      case ApiRequirement.YourRecentSports:
        return new YourRecentSportsRequirement();
      default:
        throw new Error('Unknown ApiRequirement');
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
