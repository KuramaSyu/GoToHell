/**
 * Generates an array of marks and a step value for a slider component.
 *
 * @param steps - The number of steps to divide the range into.
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns An object containing:
 *   - `marks`: An array of objects, each with a `value` and `label` representing the slider marks.
 *   - `stepValue`: The calculated step value between marks.
 *
 * @remarks
 * - If the range (`max - min`) is smaller than the number of steps, the step value is adjusted accordingly.
 * - Ensures the maximum value (`max`) is always included as the last mark.
 */
export function GenerateMarks(steps: number, min: number, max: number) {
  var marks: { value: number; label: string }[] = [];
  const stepValue =
    max - min < steps ? (max - min) / steps : Math.ceil((max - min) / steps);
  for (let i = min; i <= max; i += stepValue) {
    marks.push({ value: i, label: i.toString() });
  }
  if (Number(marks[-1]) !== max) {
    marks.push({ value: max, label: max.toString() });
  }
  return { marks, stepValue };
}
