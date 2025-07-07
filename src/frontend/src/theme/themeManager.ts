import { createTheme } from '@mui/material/styles';
import { Vibrant } from 'node-vibrant/browser';
import { CustomThemeConfig, CustomTheme } from '../theme/customTheme';
import {
  docsTheme,
  customThemes,
  defaultTheme,
  useThemeStore,
} from '../zustand/useThemeStore';
import { error } from 'console';
import useErrorStore from '../zustand/Error';

// Augment MUI's Theme to include extra custom properties.
declare module '@mui/material/styles' {
  interface Theme {
    palette: Palette;
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

export function buildCustomTheme(
  primaryMain: string,
  lightVibrantHex: string,
  darkVibrantHex: string,
  secondaryMain: string,
  lightMutedHex: string,
  darkMutedHex: string,
  vibrantHex: string,
  mutedHex: string,
  chosenBackground: string,
  config: { name: string; longName: string },
  isDark: boolean
): CustomTheme {
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
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
      // Extra vibrant palette values
      vibrant: {
        main: vibrantHex,
        light: lightVibrantHex,
        dark: darkVibrantHex,
      },
      // Extra muted palette values
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
  }) as CustomTheme;
}

// Helper function that selects the correct color based on mode.
// const autoSelect = (light: string, dark: string, isDark: boolean) =>
//   isDark ? dark : light;
export class ThemeManager {
  private themes: Map<string, CustomThemeConfig>;
  private static instance: ThemeManager | undefined;
  // For now, we use a constant to choose dark mode; later this can be dynamically set.
  private readonly isDark: boolean = true;

  private constructor(configs: CustomThemeConfig[]) {
    this.themes = new Map();
    configs.forEach((config) => this.themes.set(config.name, config));
  }

  public static getInstance(): ThemeManager {
    if (ThemeManager.instance === undefined) {
      ThemeManager.instance = new ThemeManager(customThemes);
    }
    return ThemeManager.instance;
  }

  /**
   * Asynchronously generates an MUI theme.
   * Always runs Vibrant on the randomly chosen background.
   * If config.primary/secondary are provided, they override Vibrant's primary result.
   * The full extracted palette is used to populate primary, secondary, and extra palette keys.
   */
  public async generateTheme(themeName: string): Promise<CustomTheme | null> {
    const background = useThemeStore.getState().theme.custom.backgroundImage;
    switch (themeName) {
      case 'docsTheme':
        return docsTheme;
      case 'default':
        return defaultTheme;
    }
    const themeConfig = this.themes.get(themeName);
    if (!themeConfig) {
      console.warn(`Theme "${themeName}" not found.`);
      return null;
    }

    // Randomly choose one background image.
    var backgrounds = themeConfig.backgrounds;
    if (backgrounds.length > 1) {
      backgrounds = backgrounds.filter((b) => b !== background);
    }
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const chosenBackground = backgrounds[randomIndex];

    // Always extract the palette using Vibrant.
    let extractedPalette;
    try {
      // Load the image first, then process with Vibrant
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Needed for CORS if images are on different domain

      // display timer after too much loading time
      const warningTimer = setTimeout(() => {
        useErrorStore
          .getState()
          .setErrorMessage(
            `Loading image for theme ${themeName} takes longer then expected`
          );
      }, 1200);
      // Create a promise to wait for the image to load
      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = () => {
          clearTimeout(warningTimer);
          resolve(img);
        };
        img.onerror = (e) => {
          clearTimeout(warningTimer);
          reject(e);
          useErrorStore
            .getState()
            .setErrorMessage(
              `Failed to load image for theme ${themeName} with URL "${chosenBackground}". Using default Theme`
            );
        };
        img.src = chosenBackground!;
      });

      // Wait for the image to load, then process with Vibrant
      const loadedImg = await imageLoaded;
      extractedPalette = await Vibrant.from(
        loadedImg as HTMLImageElement
      ).getPalette();
    } catch (err) {
      console.error('Error extracting colors with Node-Vibrant:', err);
      extractedPalette = {};
      return {
        ...defaultTheme,
        custom: {
          themeName: themeConfig.name,
          longName: themeConfig.longName,
          backgroundImage: themeConfig.backgrounds[0] ?? '',
        },
      };
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
    const primaryMain = themeConfig.primary || vibrantHex;
    const secondaryMain = themeConfig.secondary || darkVibrantHex;

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
        themeName: themeConfig.name,
        longName: themeConfig.longName,
      },
    }) as CustomTheme;
  }
}
