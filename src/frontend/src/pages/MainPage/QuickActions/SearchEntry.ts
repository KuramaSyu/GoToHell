import { useSportStore } from '../../../useSportStore';
import { useSportResponseStore } from '../../../zustand/sportResponseStore';
import { customThemes, useThemeStore } from '../../../zustand/useThemeStore';

/**
 * Represents an Abstract Element, which can be selected
 */
export interface SearchEntry {
  name: string;
  isDisplayed: boolean;

  /**
   * This "selects" the current Search Entry in sense of, that is is now the used Game/Sport
   */
  select(): void;
  displayName(): string;
  getNames(): string[];
  setIsDisplayed: (isDisplayed: boolean) => void;
  cloneWith: (changes: Partial<SearchEntry>) => SearchEntry;
}

abstract class DefaultSearchEntry implements SearchEntry {
  abstract name: string;
  isDisplayed: boolean = true;

  abstract select(): void;
  abstract displayName(): string;
  setIsDisplayed = (isDisplayed: boolean) => {
    this.isDisplayed = isDisplayed;
  };

  getNames(): string[] {
    return [this.name, this.displayName()];
  }

  cloneWith: (changes: Partial<SearchEntry>) => SearchEntry = (changes) => {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
      changes
    ) as SearchEntry;
  };
}
/**
 * Represents any of the available Sport Kinds
 */
export class SportEntry extends DefaultSearchEntry {
  name: string;
  constructor(sport: string, isDisplayed: boolean = true) {
    super();
    this.name = sport;
    this.isDisplayed = isDisplayed;
  }

  select(): void {
    const sportResponse = useSportResponseStore.getState().sportResponse;
    const { setSport, currentSport } = useSportStore.getState();
    const sportMultiplier = sportResponse?.sports[this.name];
    if (sportMultiplier === undefined) return;
    setSport({
      ...currentSport,
      sport: this.name,
      sport_multiplier: sportMultiplier,
    });
  }

  /**
   *
   * @returns The display name of the sport, e.g. "Russian Twist" for "russian_twist"
   */
  displayName(): string {
    return this.name
      .replace('_', ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}

/**
 * Represents any of the available games
 */
export class GameEntry extends DefaultSearchEntry {
  name: string;
  constructor(game: string) {
    super();
    this.name = game;
  }

  select(): void {
    const { setTheme } = useThemeStore.getState();
    setTheme(this.name);
  }

  displayName(): string {
    const theme = customThemes.find((theme) => theme.name === this.name);
    return theme?.longName ?? this.name;
  }
}
