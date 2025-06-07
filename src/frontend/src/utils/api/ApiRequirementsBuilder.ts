import { useUserStore } from '../../userStore';
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

export class UserRequirement extends ApiRequirementABC {
  needsFetch(): Boolean {
    return useUserStore.getState().user === null;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchUser();
  }
}

export class TotalScoreRequirement extends ApiRequirementABC {
  needsFetch(): Boolean {
    return useTotalScoreStore.getState().amounts.length === 0;
  }

  async fetch(): Promise<void> {
    await new UserApi().fetchTotalScore();
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
