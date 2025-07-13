import { DiscordUserImpl } from '../../components/DiscordLogin';
import { useDeathAmountStore } from '../../components/NumberSlider';
import { DefaultSportsDefinition } from '../../models/Preferences';
import SportRow, { SportScore } from '../../models/Sport';
import { useUserStore } from '../../userStore';
import { useSportStore } from '../../useSportStore';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { useRecentSportsStore } from '../../zustand/RecentSportsState';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { UploadError } from '../errors/UploadError';
import { UserApi } from './Api';
import { PostSportsResponse } from './responses/Sport';

abstract class UploadStrategyABC {
  uploadBuilder: UploadBuilder;
  constructor(uploadBuilder: UploadBuilder) {
    this.uploadBuilder = uploadBuilder;
  }

  abstract upload(): Promise<{
    message?: string;
    results?: SportScore[];
  }>;
}

class PostSportUploadStrategy extends UploadStrategyABC {
  async upload(): Promise<{
    message?: string;
    results?: SportScore[];
  }> {
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
    const startTime = new Date().getTime();
    try {
      const sport = new SportRow(
        wrapped.sport.sport!,
        wrapped.sport.game!,
        wrapped.exerciseAmount!
      );
      console.timeLog(`Upload Sport: ${sport.toJson()}`);
      var data = await new UserApi().postSports([sport]);

      // wait artificially 1s, for upload animation
      // Calculate elapsed time in milliseconds.
      const elapsedTime = new Date().getTime() - startTime;
      const minimumDuration = 1000;

      // Wait for the rest of the minimum duration if necessary.
      if (elapsedTime < minimumDuration) {
        const remainingTime = minimumDuration - elapsedTime;
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      if (data !== null) {
        const parsed_data = data;

        if (parsed_data.results) {
          // data.results is now an array of SportAmount
          console.log(data.results);

          if (wrapped.triggerRefresh) {
            wrapped.updateStores(parsed_data.results); // update total scores and death amount
          }
        }
        return parsed_data;
      } else {
        throw new UploadError(
          'Response was null, perhaps you are offline? This should not happen.'
        );
      }
    } catch (error) {
      throw new UploadError(String(error));
    }
  }
}

class OverdueDeathsUploadStrategy extends UploadStrategyABC {
  async upload(): Promise<{
    message?: string;
    results?: SportScore[];
  }> {
    return this.uploadBuilder.upload();
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

  constructor() {
    this.user = useUserStore.getState().user;
    this.deathAmount = null;
    this.error = null;
    this.sport = null;
    this.exerciseAmount = null;
    this.snackbarUpdatesEnabled = false;
    this.triggerRefresh = false;
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

  async upload(): Promise<{ message?: string; results?: SportScore[] }> {
    if (!this.user) {
      throw new UploadError('Please Login with Discord');
    }
    if (this.deathAmount === 0) {
      throw new UploadError('Yeah, just upload nothing. Good idea indeed');
    }

    if (this.sport === null || this.sport.sport === null) {
      throw new UploadError(
        `What? Should I upload ${this.deathAmount} apples? Perhaps oranges?`
      );
    }
    const startTime = new Date().getTime();
    try {
      const sport = new SportRow(
        this.sport.sport!,
        this.sport.game!,
        this.exerciseAmount!
      );
      console.timeLog(`Upload Sport: ${sport.toJson()}`);
      var data = await new UserApi().postSports([sport]);

      // wait artificially 1s, for upload animation
      // Calculate elapsed time in milliseconds.
      const elapsedTime = new Date().getTime() - startTime;
      const minimumDuration = 1000;

      // Wait for the rest of the minimum duration if necessary.
      if (elapsedTime < minimumDuration) {
        const remainingTime = minimumDuration - elapsedTime;
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      if (data !== null) {
        const parsed_data = data;

        if (parsed_data.results) {
          // data.results is now an array of SportAmount
          console.log(data.results);

          if (this.triggerRefresh) {
            this.updateStores(parsed_data.results); // update total scores and death amount
          }
        }
        return parsed_data;
      } else {
        throw new UploadError(
          'Response was null, perhaps you are offline? This should not happen.'
        );
      }
    } catch (error) {
      throw new UploadError(String(error));
    }
  }

  /**
   * updates the zustand stores:
   * - `TotalScoreStore` to refresh the total scores `results`
   * - `DeathAmountStore` to reset the death amount to 0
   */
  updateStores(results: SportScore[] | null): void {
    // TODO: this also triggers timeline to update
    // recent activities. make better with websocket
    if (results !== null) {
      useTotalScoreStore.getState().setAmounts(results);
      useTotalScoreStore.getState().triggerRefresh(); // update total scores
    }
    useDeathAmountStore.getState().setAmount(0);
  }
}
