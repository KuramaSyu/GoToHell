import { Theme } from '@mui/material/styles';
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
  custom: {
    backgroundImage: string;
    themeName: string;
    longName: string;
  };
  blendWithConstrast(color: string, amount: number): string;
  blendAgainstContrast(color: string, amount: number): string;
}

export interface CustomThemeConfig {
  name: string; // Short identifier, e.g. 'ocean'
  longName: string; // Descriptive name, e.g. 'Ocean Breeze'
  backgrounds: string[];
  // Optional overrides – if provided these will be used instead of Vibrant extraction.
  primary?: string;
  secondary?: string;
}

export class CustomThemeImpl extends Object implements CustomTheme {
  // Declare all Theme properties
  palette!: CustomTheme['palette'];
  custom!: CustomTheme['custom'];
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

  constructor(theme: Theme, config: CustomThemeConfig) {
    super();
    Object.assign(this, theme);

    this.custom = {
      backgroundImage: config.backgrounds[0] || '',
      themeName: config.name,
      longName: config.longName,
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
  blendWithContrast(mainColor: ColorInput, amount: number) {
    const color = this.resolveColor(mainColor);
    const invertedContrastColor = this.palette.getContrastText(color); // '#fff' or '#000'

    const mainRgb = hexToRgb(color);
    const contrastRgb = hexToRgb(invertedContrastColor);
    const blended = blendColors(mainRgb, contrastRgb, amount);

    return rgbToHex(blended);
  }

  /**
   * mixes the mainColor with its calculated contrast color
   * to a specified amount. Like a dynamic brighten() or darken()
   * depending on the color's luminance.
   * @param mainColor the color to mix
   * @param amount the amount to mix, 0.0 = mainColor, 1.0 = contrastColor
   * @returns the blended color in hex format
   */
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
   * @returns
   */
  private resolveColor(color: ColorInput): string {
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
      default:
        return color;
    }
  }
}
