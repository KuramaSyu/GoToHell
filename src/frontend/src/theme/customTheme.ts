import { Theme, Palette, alpha, lighten, darken } from '@mui/material/styles';
import {
  blendColors,
  hexToRgb,
  invertColor,
  rgbToHex,
} from '../utils/blendWithContrast';

export type ColorInput =
  | string
  | 'primary'
  | 'secondary'
  | 'vibrant'
  | 'muted'
  | 'primaryLight'
  | 'primaryDark'
  | 'secondaryLight'
  | 'secondaryDark';

export interface CustomTheme extends Theme {
  palette: Palette & {
    //palette: Theme['palette'] & {
    vibrant: {
      main: string;
      light: string;
      dark: string;
    };
    muted: {
      main: string;
      light: string;
      dark: string;
    };
  };
  colorTransition: {
    root: { transition: string; '&:hover'?: { transition: string } };
  };
  custom: ThemeCustomExtension;

  /**
   * mixes the mainColor with the contrast color from the theme
   * to a specified amount. Like a dynamic brigthen() or darken()
   * depending theme.
   * @param mainColor the color to mix
   * @param theme the theme to use to get the contrast color
   * @param amount the amount to mix, 0.0 = mainColor, 1.0 = contrastColor
   * @returns the blended color in hex format
   */
  blendWithContrast(color: ColorInput, amount: number): string;

  /**
   * mixes the mainColor with its calculated contrast color
   * to a specified amount. Like a dynamic brighten() or darken()
   * depending on the color's luminance.
   * @param mainColor the color to mix
   * @param amount the amount to mix, 0.0 = mainColor, 1.0 = contrastColor
   * @returns the blended color in hex format
   */
  blendAgainstContrast(color: ColorInput, amount: number): string;

  /**
   * Change Saturation of a color by converting it to HSL
   *
   * @param color the color to change saturation of
   * @param ChangeAmount (-1 to 1) the relative amount to change saturation depending on the current saturation. 0 = no change, -1 = desaturate to gray, 1 = fully saturate.
   * @returns the color with changed saturation in hex format
   */
  changeSaturation(color: ColorInput, ChangeAmount: number): string;

  /**
   * Updates `transitions.duration.complex` in-place and refreshes derived
   * transition style snippets that depend on that duration.
   */
  setComplexDuration(durationMs: number): void;

  /**
   * Multiplies all transition duration values in-place.
   */
  setDurationMultiplier(multiplier: number): void;

  /**
   * Replaces transition duration values in-place.
   */
  setTransitionDurations(durations: Theme['transitions']['duration']): void;
}
/**
 * Config to extend theme.
 * Multiple backgrounds. actual theme gets one of them.
 */
export interface CustomThemeConfig {
  name: string; // Short identifier, e.g. 'ocean'
  longName: string; // Descriptive name, e.g. 'Ocean Breeze'
  backgrounds: string[];
}

export interface ThemeCustomExtension {
  themeName: string; // Short identifier, e.g. 'ocean'
  longName: string; // Descriptive name, e.g. 'Ocean Breeze'
  backgroundImage: string;
}

/**
 * Implementation of CustomTheme with following features:
 * - blendWithContrast and blendAgainstContrast methods
 * - adjusted text colors
 * - adjusted background colors
 */
export class CustomThemeImpl extends Object implements CustomTheme {
  // Declare all Theme properties
  palette!: CustomTheme['palette'];
  custom!: ThemeCustomExtension;
  blendWithConstrast: any;
  breakpoints!: Theme['breakpoints'];
  direction!: Theme['direction'];
  mixins!: Theme['mixins'];
  components?: Theme['components'];
  shadows!: Theme['shadows'];
  spacing!: Theme['spacing'];
  transitions!: Theme['transitions'];
  typography!: Theme['typography'];
  zIndex!: Theme['zIndex'];
  shape!: Theme['shape'];
  unstable_sx!: Theme['unstable_sx'];
  unstable_sxConfig!: Theme['unstable_sxConfig'];
  applyStyles!: Theme['applyStyles'];
  containerQueries!: Theme['containerQueries'];
  colorTransition: {
    root: { transition: string; '&:hover'?: { transition: string } };
  };

  // Wrap the methods to match the Theme interface signature
  alpha: (color: string, value: string | number) => string;
  lighten: (color: string, coefficient: string | number) => string;
  darken: (color: string, coefficient: string | number) => string;

  constructor(theme: CustomTheme);
  constructor(theme: Theme, config: ThemeCustomExtension);
  constructor(
    theme: Theme,
    config?: ThemeCustomExtension,
    recalculateColors?: boolean,
  );
  constructor(
    theme: Theme | CustomTheme,
    config?: ThemeCustomExtension,
    recalculateColors?: boolean,
  ) {
    super();
    Object.assign(this, theme);

    // If config is provided, use it; otherwise use theme's custom property
    if (config) {
      this.custom = config;
    } else if ('custom' in theme) {
      this.custom = (theme as CustomTheme).custom;
    }

    // Wrap methods to handle string | number parameters
    this.alpha = (color: string, value: string | number) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return alpha(color, numValue);
    };
    this.lighten = (color: string, coefficient: string | number) => {
      const numCoef =
        typeof coefficient === 'string' ? parseFloat(coefficient) : coefficient;
      return lighten(color, numCoef);
    };
    this.darken = (color: string, coefficient: string | number) => {
      const numCoef =
        typeof coefficient === 'string' ? parseFloat(coefficient) : coefficient;
      return darken(color, numCoef);
    };

    this.colorTransition = {
      root: {
        transition: this.transitions.create(
          ['background-color', 'color', 'border-color'],
          {
            duration: this.transitions.duration.complex,
          },
        ),
        '&:hover': {
          transition: this.transitions.create(
            ['background-color', 'color', 'border-color', 'transform'],
            {
              duration: this.transitions.duration.short,
            },
          ),
        },
      },
    };

    if (recalculateColors === true) {
      // blend background colors against contrast color (to increase contrast with text)
      const contrastColor = invertColor(
        this.palette.getContrastText(this.palette.background.default),
      );
      this.palette.background = {
        default: rgbToHex(
          blendColors(
            hexToRgb(this.palette.muted.dark),
            hexToRgb(contrastColor),
            0.25,
          ),
        ),
        paper: rgbToHex(
          blendColors(
            hexToRgb(this.palette.muted.dark),
            hexToRgb(contrastColor),
            0,
          ),
        ),
      };

      // blend text colors with contrast color
      this.palette.text = {
        primary: rgbToHex(
          blendColors(
            hexToRgb(this.palette.primary.light),
            hexToRgb(
              this.palette.getContrastText(this.palette.background.default),
            ),
            0.6,
          ),
        ),
        secondary: rgbToHex(
          blendColors(
            hexToRgb(this.palette.secondary.light),
            hexToRgb(
              this.palette.getContrastText(this.palette.background.default),
            ),
            0.6,
          ),
        ),
        disabled: rgbToHex(
          blendColors(
            hexToRgb(this.palette.primary.main),
            hexToRgb(
              this.palette.getContrastText(this.palette.background.default),
            ),
            0.4,
          ),
        ),
      };

      // recalculate success, info, warning, error colors
      this.palette.success = {
        ...this.palette.success,
        main: rgbToHex(
          blendColors(
            hexToRgb(this.palette.primary.main),
            hexToRgb(
              this.palette.getContrastText(this.palette.background.default),
            ),
            0.3,
          ),
        ),
      };

      this.palette.info = {
        ...this.palette.info,
        main: rgbToHex(
          blendColors(
            hexToRgb(this.palette.secondary.main),
            hexToRgb(
              this.palette.getContrastText(this.palette.background.default),
            ),
            0.3,
          ),
        ),
      };

      this.palette.warning = {
        ...this.palette.warning,
        main: rgbToHex(
          blendColors(
            hexToRgb(this.palette.warning.main),
            hexToRgb('#FFA500'), // orange
            0.5,
          ),
        ),
      };

      this.palette.error = {
        ...this.palette.error,
        main: rgbToHex(
          blendColors(
            hexToRgb(this.palette.error.main),
            hexToRgb('#FF0000'), // red
            0.5,
          ),
        ),
      };

      // Merge custom component overrides
      this.components = {
        ...this.components, // Spread existing component overrides
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: this.palette.background.paper,
              color: this.palette.text.primary,
              fontSize: this.typography.body1.fontSize,
              borderRadius: '8px',
            },
            arrow: {
              color: this.palette.background.paper,
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiButtonGroup: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },

        MuiInputBase: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiPaper: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiSlider: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiButtonBase: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiTypography: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
        MuiToggleButtonGroup: {
          styleOverrides: {
            ...this.colorTransition,
          },
        },
      };

      // bend text colors from primary and secondary colors
      this.palette.primary.contrastText = this.blendWithContrast(
        'primary',
        0.66,
      );
      this.palette.secondary.contrastText = this.blendWithContrast(
        'secondary',
        0.66,
      );
    }
  }

  blendWithContrast(mainColor: ColorInput, amount: number): string {
    const color = this.resolveColor(mainColor);
    const invertedContrastColor = this.palette.getContrastText(color); // '#fff' or '#000'

    const mainRgb = hexToRgb(color);
    const contrastRgb = hexToRgb(invertedContrastColor);
    const blended = blendColors(mainRgb, contrastRgb, amount);

    return rgbToHex(blended);
  }

  blendAgainstContrast(mainColor: ColorInput, amount: number): string {
    const color = this.resolveColor(mainColor);
    const contrastColor = invertColor(this.palette.getContrastText(color));

    const mainRgb = hexToRgb(color);
    const contrastRgb = hexToRgb(contrastColor);

    // combines main color with contrast color
    const blended = blendColors(mainRgb, contrastRgb, amount);

    return rgbToHex(blended);
  }

  changeSaturation(color: ColorInput, changeAmount: number): string {
    const resolved = this.resolveColor(color);
    const rgb = hexToRgb(resolved);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    const clampedAmount = Math.max(-1, Math.min(1, changeAmount));
    const nextSaturation =
      clampedAmount >= 0
        ? hsl.s + (1 - hsl.s) * clampedAmount
        : hsl.s + hsl.s * clampedAmount;

    const adjusted = this.hslToRgb(hsl.h, this.clamp01(nextSaturation), hsl.l);

    return rgbToHex(adjusted);
  }

  setComplexDuration(durationMs: number): void {
    // Keep duration valid and integral (MUI expects milliseconds).
    const normalized = Math.max(1, Math.round(durationMs));

    // Delegate to the generic setter so dependent transition snippets are refreshed.
    this.setTransitionDurations({
      ...this.transitions.duration,
      complex: normalized,
    });
  }

  setDurationMultiplier(multiplier: number): void {
    // Defensive guard: invalid multipliers fall back to normal speed.
    const safeMultiplier =
      Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

    // Keep each duration >= 1ms to avoid zero/negative transition times.
    const scale = (value: number) =>
      Math.max(1, Math.round(value * safeMultiplier));

    const current = this.transitions.duration;

    // Scale non-leaving or entering tokens only
    this.setTransitionDurations({
      ...current,
      shortest: scale(current.shortest),
      shorter: scale(current.shorter),
      short: scale(current.short),
      standard: scale(current.standard),
      complex: scale(current.complex),
      enteringScreen: current.enteringScreen,
      leavingScreen: current.leavingScreen,
    });
  }

  setTransitionDurations(durations: Theme['transitions']['duration']): void {
    // Merge allows partial updates while preserving untouched duration tokens.
    this.transitions.duration = {
      ...this.transitions.duration,
      ...durations,
    };

    // Some style snippets are precomputed and must be rebuilt after duration changes.
    this.refreshColorTransition();
  }

  private refreshColorTransition(): void {
    // Rebuild reusable transition definitions that depend on `transitions.duration`.
    this.colorTransition = {
      root: {
        transition: this.transitions.create(
          ['background-color', 'color', 'border-color'],
          {
            duration: this.transitions.duration.complex,
          },
        ),
        '&:hover': {
          transition: this.transitions.create(
            ['background-color', 'color', 'border-color', 'transform'],
            {
              duration: this.transitions.duration.short,
            },
          ),
        },
      },
    };
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private rgbToHsl(
    r: number,
    g: number,
    b: number,
  ): { h: number; s: number; l: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    const l = (max + min) / 2;

    if (delta === 0) {
      return { h: 0, s: 0, l };
    }

    const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let h = 0;

    switch (max) {
      case rn:
        h = (gn - bn) / delta + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      case bn:
        h = (rn - gn) / delta + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;

    return { h, s, l };
  }

  private hslToRgb(
    h: number,
    s: number,
    l: number,
  ): { r: number; g: number; b: number } {
    if (s === 0) {
      const gray = Math.round(l * 255);
      return { r: gray, g: gray, b: gray };
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const hue2rgb = (t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };

    const r = hue2rgb(h + 1 / 3);
    const g = hue2rgb(h);
    const b = hue2rgb(h - 1 / 3);

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * returns hex color for given ColorInput
   *
   * @param color the hex itself, or the name (primary, secondary, ...)
   * @returns a hex color string
   */
  resolveColor(color: ColorInput): string {
    switch (color) {
      case 'primary':
        return this.palette.primary.main;
      case 'secondary':
        return this.palette.secondary.main;
      case 'primaryLight':
        return this.palette.primary.light;
      case 'primaryDark':
        return this.palette.primary.dark;
      case 'secondaryLight':
        return this.palette.secondary.light;
      case 'secondaryDark':
        return this.palette.secondary.dark;
      case 'vibrant':
        return this.palette.vibrant.main;
      case 'muted':
        return this.palette.muted.main;
    }
    if (color.startsWith('#')) {
      return color;
    }
    console.error(`Unknown color input in resolveColor: ${color}`);
    return color;
  }
}
