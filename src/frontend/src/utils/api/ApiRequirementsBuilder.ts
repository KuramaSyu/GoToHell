interface ApiReuqirement {
  needsFetch: () => Boolean;
  fetch: () => Promise<void>;
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
