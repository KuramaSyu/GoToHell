import { count } from 'console';
import { DiscordUserImpl } from '../../components/DiscordLogin';
import { useDeathAmountStore } from '../../pages/MainPage/NumberSlider';
import { DefaultSportsDefinition } from '../../models/Preferences';
import SportRow, { SportScore } from '../../models/Sport';
import { useUserStore } from '../../userStore';
import { useSportStore } from '../../useSportStore';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { UploadError } from '../errors/UploadError';
import { UserApi } from './Api';
import { OverdueDeathsApi } from './OverdueDeathsApi';
import { PostSportsResponse } from './responses/Sport';
import { PostOverdueDeathsReply } from './responses/OverdueDeaths';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';

abstract class UploadStrategyABC {
  uploadBuilder: UploadBuilder;
  constructor(uploadBuilder: UploadBuilder) {
    this.uploadBuilder = uploadBuilder;
  }

  /**
   * updates the zustand stores after the upload is done.
   */
  abstract updateStores(): void;

  /**
   * uploads the data to the server and returns a promise.
   * @throws UploadError if the upload fails
   */
  abstract upload(): Promise<null>;
}

class PostSportUploadStrategy extends UploadStrategyABC {
  result: PostSportsResponse | null = null;
  overdueDeathsResult: null | PostOverdueDeathsReply = null;

  /**
   * updates the zustand stores:
   * - `TotalScoreStore` to refresh the total scores `results`
   * - `DeathAmountStore` to reset the death amount to 0
   *
   * for updating it uses the private `result` variable which is set during the upload
   */
  updateStores() {
    // TODO: this also triggers timeline to update
    // recent activities. make better with websocket
    if (this.result !== null) {
      const reply = this.result;
      const { amounts, setAmounts } = useTotalScoreStore.getState();
      // update total scores
      setAmounts([
        ...amounts.filter((a) => {
          return !reply.results.some((r) => r.kind === a.kind);
        }),
        ...reply.results,
      ]);
      useTotalScoreStore.getState().triggerRefresh(); // update total scores
    }
    if (this.overdueDeathsResult !== null) {
      // update overdue deaths
      const overdueDeaths = this.overdueDeathsResult.data;
      const setOverdueDeaths =
        useOverdueDeathsStore.getState().setOverdueDeaths;
      const prev = useOverdueDeathsStore.getState().overdueDeathsList;
      setOverdueDeaths([
        ...prev.filter((p) => p.game !== overdueDeaths.game),
        overdueDeaths,
      ]);
    }
    useDeathAmountStore.getState().setAmount(0);
  }

  async upload(): Promise<null> {
    const wrapped = this.uploadBuilder;
    if (!wrapped.user) {
      throw new UploadError('Please Login with Discord');
    }
    if (wrapped.deathAmount === 0) {
      throw new UploadError('Yeah, just upload nothing. Good idea indeed');
    }

    if (wrapped.sport === null || wrapped.sport.sport === null) {
      throw new UploadError(
        `What? Should I upload ${wrapped.deathAmount} apples? Perhaps oranges?`
      );
    }

    const overdueDeaths =
      useOverdueDeathsStore
        .getState()
        .overdueDeathsList.find((x) => x.game === wrapped.sport?.game) || null;
    try {
      const sport = new SportRow(
        wrapped.sport.sport!,
        wrapped.sport.game!,
        wrapped.exerciseAmount!
      );
      console.timeLog(`Upload Sport: ${sport.toJson()}`);

      // upload sport row
      var uploadPromise = new UserApi().postSports([sport], false);

      // upload updated overdue deaths
      var overdueDeathsPromise = new Promise((resolve) => resolve(null));
      if (overdueDeaths !== null) {
        overdueDeathsPromise = new OverdueDeathsApi().put(
          sport.game,
          wrapped.deathAmount!,
          (currentCount: number, count: number) => {
            return Math.max(currentCount - count, 0);
          },
          false
        );
      }

      // run both uploads in parallel
      const [data, overdueDeathsData] = await Promise.all([
        uploadPromise,
        overdueDeathsPromise,
      ]);

      this.overdueDeathsResult = overdueDeathsData as PostOverdueDeathsReply;

      // save result and maybe call updateStores
      if (data !== null) {
        this.result = data;

        if (this.result.results && wrapped.triggerRefresh) {
          this.updateStores(); // update total scores and death amount
        }
      } else {
        throw new UploadError(
          'Response was null, perhaps you are offline? This should not happen.'
        );
      }
    } catch (error) {
      throw new UploadError(String(error));
    }
    return null;
  }
}

class OverdueDeathsUploadStrategy extends UploadStrategyABC {
  overdueDeathsResult: PostOverdueDeathsReply | null = null;

  updateStores(): void {
    if (this.overdueDeathsResult !== null) {
      // update overdue deaths
      const overdueDeaths = this.overdueDeathsResult.data;
      const setOverdueDeaths =
        useOverdueDeathsStore.getState().setOverdueDeaths;
      const prev = useOverdueDeathsStore.getState().overdueDeathsList;
      setOverdueDeaths([
        ...prev.filter((p) => p.game !== overdueDeaths.game),
        overdueDeaths,
      ]);
    }

    useDeathAmountStore.getState().setAmount(0);
  }

  async upload(): Promise<null> {
    const wrapped = this.uploadBuilder;
    if (!wrapped.user) {
      throw new UploadError('Please Login with Discord');
    }
    if (wrapped.deathAmount === 0) {
      throw new UploadError('Yeah, just upload nothing. Good idea indeed');
    }

    if (wrapped.sport === null || wrapped.sport.sport === null) {
      throw new UploadError(
        `What? Should I upload ${wrapped.deathAmount} apples? Perhaps oranges?`
      );
    }

    if (wrapped.deathAmount === null) {
      throw new UploadError(
        "You can't delay your exercises, if you don't have any deaths"
      );
    }

    try {
      const sport = new SportRow(
        wrapped.sport.sport!,
        wrapped.sport.game!,
        wrapped.exerciseAmount!
      );
      console.timeLog(`Upload OverdueDeaths: ${sport.toJson()}`);

      // upload overdue deaths
      this.overdueDeathsResult = await new OverdueDeathsApi().put(
        sport.game,
        wrapped.deathAmount,
        (currentCount: number, count: number) => {
          // lambda for increment logic
          return currentCount + count;
        },
        false // do not update stores here, hence it will be done later
      );

      return null;
    } catch (error) {
      throw new UploadError(String(error));
    }
  }
}
/**
 * Class for building upload step by step. `upload()` will return promise and can
 * throw errors if the payload is invalid or misses something.
 */
export class UploadBuilder {
  user: DiscordUserImpl | null;
  deathAmount: number | null;
  exerciseAmount: number | null;
  private error: UploadError | null;
  sport: DefaultSportsDefinition | null;
  private snackbarUpdatesEnabled: boolean;
  triggerRefresh: boolean;
  uploadStrategy: UploadStrategyABC;

  constructor() {
    this.user = useUserStore.getState().user;
    this.deathAmount = null;
    this.error = null;
    this.sport = null;
    this.exerciseAmount = null;
    this.snackbarUpdatesEnabled = false;
    this.triggerRefresh = false;
    this.uploadStrategy = new PostSportUploadStrategy(this);
  }

  /**
   *
   * @returns a `UploadBuilder` uses zustand amounts for DeathAmount, Sport and ExerciseAmount
   */
  static default(): UploadBuilder {
    return new UploadBuilder()
      .setDeathAmount(null)
      .setSport(null)
      .setExerciseAmount(null);
  }

  /**
   * if enabled, the `TotalScoreStore` triggers a refresh and `DeathAmountStore` will be updated to 0
   * @param enabled whether or not the zustand refresh should be triggered
   * @returns
   */
  setStoreUpdate(enabled: boolean): this {
    this.triggerRefresh = enabled;
    return this;
  }

  /**
   * sets the upload strategy to either `postSport` or `overdueDeaths`
   *
   * @param uploadStrategy the upload strategy to use
   * @returns the current UploadBuilder instance
   */
  setUploadStrategy(
    uploadStrategy: 'postSport' | 'overdueDeaths'
  ): UploadBuilder {
    switch (uploadStrategy) {
      case 'postSport':
        this.uploadStrategy = new PostSportUploadStrategy(this);
        break;
      case 'overdueDeaths':
        this.uploadStrategy = new OverdueDeathsUploadStrategy(this);
        break;
      default:
        throw new UploadError('Unknown upload strategy');
    }
    return this;
  }

  /**
   * sets the amount or get's it from the `useDeathAmountStore` if null
   */
  setDeathAmount(amount: number | null): UploadBuilder {
    if (amount !== null) {
      this.deathAmount = amount;
    } else {
      this.deathAmount = useDeathAmountStore.getState().amount;
    }
    return this;
  }

  /**
   * sets the exercise amount or builds it with the necessary decorators stored in `CalculatorStore`.
   *
   * @note when executing with null, `sport` and `deathAmount` needs to be set
   * @param amount the amount of exercises which will be uploaded
   * @returns
   */
  setExerciseAmount(amount: number | null): UploadBuilder {
    if (amount !== null) {
      this.exerciseAmount = amount;
    } else {
      const calculator = useCalculatorStore.getState().calculator;
      this.exerciseAmount = calculator.calculate_amount(
        this.sport?.sport!,
        this.sport?.game!,
        this.deathAmount!
      );
    }
    return this;
  }

  setEnableSnackbarUpdates(enabled: boolean): this {
    this.snackbarUpdatesEnabled = enabled;
    return this;
  }

  /**
   * sets the sport of get's it from the `useSportStore`
   */
  setSport(sport: DefaultSportsDefinition | null): UploadBuilder {
    if (sport !== null) {
      this.sport = sport;
    } else {
      this.sport = useSportStore.getState().currentSport;
    }
    return this;
  }

  private setErrorMessage(message: string) {
    this.error = new UploadError(message);
  }

  /**
   * uploads the data to the server using the UploadStrategy and returns a promise.
   * @throws UploadError if the upload fails
   */
  async upload(): Promise<null> {
    try {
      const _ = await this.uploadStrategy.upload();
    } catch (error) {
      this.setErrorMessage(String(error));
      throw this.error;
    }
    return null;
  }

  /**
   * calls the `updateStores` method from the selected upload strategy.
   */
  updateStores(): void {
    this.uploadStrategy.updateStores();
  }
}
