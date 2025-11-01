// Small wrapper to make interval calculation for timers
// a bit easier
export class DurationCalculator {
  total_ms: number;
  steps: number;
  current_step: Step;

  constructor(total_ms: number, steps: number) {
    this.total_ms = total_ms;
    this.steps = steps;
    this.current_step = new Step(0, this);
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

  // incement step by one
  next_step(): void {
    if (this.current_step.get_n() >= this.steps) {
      throw new Error('cant increment to next step. Already reached last step');
    }
    // get_n is the number not starting from 0 e.g. already incremented
    this.current_step = new Step(this.current_step.get_n(), this);
  }
}

// Represents one (most likely `currnent`) step for
// Duration calculator
export class Step {
  private n: number;
  duration_calculator: DurationCalculator;
  constructor(n: number, duration_calculator: DurationCalculator) {
    this.n = n;
    this.duration_calculator = duration_calculator;
  }

  // starting from 1
  get_n() {
    return this.n + 1;
  }

  // calculates the percentage of this step compared to the
  // total from the DurationCalculator
  get_percentage(): number {
    return this.duration_calculator.get_step_percentage() * (this.n + 1);
  }
}
