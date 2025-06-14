import { useUsersStore, useUserStore } from '../../userStore';
import { useStreakStore } from '../../zustand/StreakStore';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { UserApi } from './Api';

interface ApiReuqirement {
  needsFetch(): Boolean;
  fetch(): Promise<void>;
  fetchIfNeeded(): Promise<void>;
}

abstract class ApiRequirementABC implements ApiReuqirement {
  abstract needsFetch(): Boolean;
  abstract fetch(): Promise<void>;
  async fetchIfNeeded(): Promise<void> {
    if (this.needsFetch()) {
      await this.fetch();
    }
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
    return useStreakStore.getState().streak === null;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchStreak();
  }
}

/**
 * Class, to set, which API data is needed. This data is
 * fetched, in case it's null/undefined. Otherwise it will
 * ignore it. => It acts as assertion, that some responses are present
 */
export class ApiRequirementsBuilder {
  requirements: ApiReuqirement[];

  constructor() {
    this.requirements = [];
  }

  add(requirement: ApiReuqirement): ApiRequirementsBuilder {
    this.requirements.push(requirement);
    return this;
  }

  async build(): Promise<void> {
    var promises: Promise<void>[] = [];
    for (let requirement of this.requirements) {
      promises.push(requirement.fetch());
    }

    await Promise.all(promises);
  }
}
