import { useTheme } from '@mui/material/styles';
import { CustomTheme } from '../theme/customTheme';

// Helpers
export function hexToRgb(hex: string) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * calculates the relative luminance of a color
 *
 * @param r red amount
 * @param g green amount
 * @param b blue amount
 * @returns luminance of the color (0-1)
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs = 0, gs = 0, bs = 0] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function invertColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const inverted = {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b,
  };
  return rgbToHex(inverted);
}

export function blendColors(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  ratio: number
) {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * ratio),
    g: Math.round(color1.g + (color2.g - color1.g) * ratio),
    b: Math.round(color1.b + (color2.b - color1.b) * ratio),
  };
}

/**
 * mixes the mainColor with its calculated contrast color
 * to a specified amount. Like a dynamic brighten() or darken()
 * depending on the color's luminance.
 * @param mainColor the color to mix
 * @param amount the amount to mix, 0.0 = mainColor, 1.0 = contrastColor
 * @returns the blended color in hex format
 */
export function blendAgainstContrast(
  mainColor: string,
  theme: CustomTheme,
  amount: number
): string {
  const contrastColor = invertColor(theme.palette.getContrastText(mainColor));

  const mainRgb = hexToRgb(mainColor);
  const contrastRgb = hexToRgb(contrastColor);
  const blended = blendColors(mainRgb, contrastRgb, amount);

  return rgbToHex(blended);
}

/**
 * mixes the mainColor with the contrast color from the theme
 * to a specified amount. Like a dynamic brigthen() or darken()
 * depending theme.
 * @param mainColor the color to mix
 * @param theme the theme to use to get the contrast color
 * @param amount the amount to mix, 0.0 = mainColor, 1.0 = contrastColor
 * @returns the blended color in hex format
 */
export function blendWithContrast(
  mainColor: string,
  theme: any,
  amount: number
) {
  const contrastColor = theme.palette.getContrastText(mainColor); // '#fff' or '#000'

  const mainRgb = hexToRgb(mainColor);
  const contrastRgb = hexToRgb(contrastColor);
  const blended = blendColors(mainRgb, contrastRgb, amount);

  return rgbToHex(blended);
}

/**
 * checks if a color is dark based on its luminance
 * @param color the color to check
 * @returns true if dark, false if light
 */
export function isDarkColored(color: string): boolean {
  return getContrastColor(color) === '#ffffff';
}
