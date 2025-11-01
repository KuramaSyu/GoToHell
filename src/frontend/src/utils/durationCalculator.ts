// Small wrapper to make interval calculation for timers
// a bit easier
export class DurationCalculator {
  total_ms: number;
  steps: number;

  // 0 - (steps - 1)
  current_step: number;

  constructor(total_ms: number, steps: number) {
    this.total_ms = total_ms;
    this.steps = steps;
    this.current_step = 0;
  }

  // The duration of one step/interval in ms
  get_step_ms(): number {
    return this.total_ms / this.steps;
  }

  // returns the progress
  // percentage (0 - 1) of one step.
  get_step_percentage(): number {
    return this.steps / 100;
  }
}
