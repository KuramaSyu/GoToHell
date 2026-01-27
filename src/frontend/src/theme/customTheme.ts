import { Theme, alpha, lighten, darken } from '@mui/material/styles';
import { Palette } from '@mui/material/styles/createPalette';
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
            },
            arrow: {
              color: this.palette.background.paper,
            },
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
