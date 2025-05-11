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
}
