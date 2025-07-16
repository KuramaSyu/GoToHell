// Add this helper function above your component

import { rgbToHex } from '@mui/material';

/**
 * Converts a hexadecimal color string to its RGB representation.
 *
 * @param hex - The hexadecimal color string (with or without a leading '#'). Can also be rgb format.
 *              Supports both 3-digit and 6-digit formats (e.g., "#fff" or "#ffffff").
 * @returns A string representing the RGB values in the format "R,G,B".
 *
 * @example
 * ```typescript
 * hexToRgbString("#ff0000"); // "255,0,0"
 * hexToRgbString("0f0");     // "0,255,0"
 * ```
 */
export function hexToRgbString(hex: string): string {
  if (hex.startsWith('rgb')) {
    hex = rgbToHex(hex);
  }
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('');
  }
  const num = parseInt(hex, 16);
  return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
}
