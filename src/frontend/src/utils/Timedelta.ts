export enum Unit {
  seconds = 1,
  minutes = 2,
  hours = 3,
}

export function unitToString(unit: Unit): string {
  switch (unit) {
    case Unit.seconds:
      return 'seconds';
    case Unit.minutes:
      return 'minutes';
    case Unit.hours:
      return 'hours';
    default:
      throw new Error('Invalid unit');
  }
}

export class Timedelta {
  totalSeconds: number;
  constructor(seconds: number) {
    this.totalSeconds = seconds;
  }

  seconds(): number {
    return this.totalSeconds % 60;
  }
  minutes(): number {
    return Math.floor(this.totalSeconds / 60) % 60;
  }
  hours(): number {
    return Math.floor(this.totalSeconds / (60 * 60));
  }

  biggestUnit(): Unit {
    if (this.hours() > 0) {
      return Unit.hours;
    } else if (this.minutes() > 0) {
      return Unit.minutes;
    } else {
      return Unit.seconds;
    }
  }
}
