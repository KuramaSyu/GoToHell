import { useTheme } from '@mui/material/styles';

// Helpers
function hexToRgb(hex: string) {
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

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
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

function blendColors(
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
 * checks if a color is dark based on the theme contrast text
 * @param theme the theme to use to get the contrast color
 * @param color the color to check, if null uses theme.palette.background.muted.main
 * @returns true if dark, false if light
 */
export function isDarkColored(theme: any, color: string | null): boolean {
  color = color || theme.palette.muted.main;
  return theme.palette.getContrastText(color) === '#fff'; // #fff or #000
}
