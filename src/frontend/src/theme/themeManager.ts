import { createTheme, Theme } from '@mui/material/styles';
import { Vibrant } from 'node-vibrant/browser';
import { CustomThemeConfig } from './interfaces';

// Augment MUI's Theme to include extra custom properties.
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      backgroundImage: string;
      themeName: string;
      longName: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      backgroundImage?: string;
      themeName?: string;
      longName?: string;
    };
  }
}

export class ThemeManager {
  private themes: Map<string, CustomThemeConfig>;
  // For now, we use a constant to choose dark mode; later this can be dynamically set.
  private readonly isDark: boolean = true;

  constructor(configs: CustomThemeConfig[]) {
    this.themes = new Map();
    configs.forEach((config) => this.themes.set(config.name, config));
  }

  /**
   * Asynchronously generates an MUI theme.
   * Always runs Vibrant on the randomly chosen background.
   * If config.primary/secondary are provided, they override Vibrant's primary result.
   * The full extracted palette is used to populate primary, secondary, and extra palette keys.
   */
  public async generateTheme(themeName: string): Promise<Theme | null> {
    const config = this.themes.get(themeName);
    if (!config) {
      console.warn(`Theme "${themeName}" not found.`);
      return null;
    }

    // Randomly choose one background image.
    const backgrounds = config.backgrounds;
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const chosenBackground = backgrounds[randomIndex];

    // Always extract the palette using Vibrant.
    let extractedPalette;
    try {
      // Load the image first, then process with Vibrant
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Needed for CORS if images are on different domain

      // Create a promise to wait for the image to load
      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = chosenBackground;
      });

      // Wait for the image to load, then process with Vibrant
      const loadedImg = await imageLoaded;
      extractedPalette = await Vibrant.from(
        loadedImg as HTMLImageElement
      ).getPalette();
    } catch (err) {
      console.error('Error extracting colors with Node-Vibrant:', err);
      extractedPalette = {};
    }

    // Get extracted swatches (with sensible fallbacks).
    const vibrantHex = extractedPalette.Vibrant
      ? extractedPalette.Vibrant.hex
      : '#1976d2';
    const lightVibrantHex = extractedPalette.LightVibrant
      ? extractedPalette.LightVibrant.hex
      : '#63a4ff';
    const darkVibrantHex = extractedPalette.DarkVibrant
      ? extractedPalette.DarkVibrant.hex
      : '#004ba0';
    const mutedHex = extractedPalette.Muted
      ? extractedPalette.Muted.hex
      : '#757575';
    const lightMutedHex = extractedPalette.LightMuted
      ? extractedPalette.LightMuted.hex
      : '#a4a4a4';
    const darkMutedHex = extractedPalette.DarkMuted
      ? extractedPalette.DarkMuted.hex
      : '#494949';

    // Use provided primary/secondary if available.
    const primaryMain = config.primary || vibrantHex;
    const secondaryMain = config.secondary || darkVibrantHex;

    // Build and return the full MUI theme.
    return createTheme({
      palette: {
        mode: this.isDark ? 'dark' : 'light',
        primary: {
          main: primaryMain,
          light: lightVibrantHex,
          dark: darkVibrantHex,
        },
        secondary: {
          main: secondaryMain,
          light: lightMutedHex,
          dark: darkMutedHex,
        },
        // Add full Vibrant palette swatches for extended use.
        vibrant: {
          main: vibrantHex,
          light: lightVibrantHex,
          dark: darkVibrantHex,
        },
        muted: {
          main: mutedHex,
          light: lightMutedHex,
          dark: darkMutedHex,
        },
      },
      custom: {
        backgroundImage: chosenBackground,
        themeName: config.name,
        longName: config.longName,
      },
    });
  }
}
