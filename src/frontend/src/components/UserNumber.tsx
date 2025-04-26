export interface StringNumber {
  number: number | null;
  setNumber: React.Dispatch<React.SetStateAction<number | null>>;
  stringNumber: string | null;
  setStringNumber: React.Dispatch<React.SetStateAction<string | null>>;
  overrideStringNumber: boolean;
}

/**
 * Handles the synchronization between a numeric value and its string representation.
 * Updates the numeric value or string representation based on the provided properties.
 *
 * @param props - An object containing the following properties:
 *   @param props.number - The current numeric value.
 *   @param props.setNumber - A function to update the numeric value.
 *   @param props.stringNumber - The current string representation of the number.
 *   @param props.setStringNumber - A function to update the string representation of the number.
 *   @param props.overrideStringNumber - A boolean indicating whether to override the string representation
 *                                       with the numeric value.
 */
export function handleStringNumber(props: StringNumber): void {
  const {
    number,
    setNumber,
    stringNumber,
    setStringNumber,
    overrideStringNumber,
  } = props;
  if (overrideStringNumber) {
    setStringNumber(String(number));
    return;
  }
  if (isNumeric(stringNumber)) {
    setNumber(Number(stringNumber));
  }
}

/**
 * Returns, whether a string (can be null) is a Number or not.
 */
export function isNumeric(s: string | null): boolean {
  if (s === null) return false;
  s = s.trim();
  if (s === '') return false;
  const n = Number(s);
  return !Number.isNaN(n) && !Number.isFinite(n);
}
