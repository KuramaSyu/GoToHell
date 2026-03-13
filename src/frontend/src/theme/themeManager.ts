import { createTheme } from '@mui/material/styles';
import { Vibrant } from 'node-vibrant/browser';
import {
  CustomThemeConfig,
  CustomTheme,
  CustomThemeImpl,
} from '../theme/customTheme';
import {
  docsTheme,
  customThemes,
  useThemeStore,
} from '../zustand/useThemeStore';
import { error } from 'console';
import useInfoStore, { SnackbarUpdateImpl } from '../zustand/InfoStore';
import { defaultTheme } from '../zustand/defaultTheme';
import {
  blendAgainstContrast,
  blendWithContrast,
} from '../utils/blendWithContrast';
import { th } from 'zod/v4/locales/index.cjs';

function isLocalOpeninaryBackground(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === 'http:' &&
      parsedUrl.hostname === 'localhost' &&
      parsedUrl.port === '3001'
    );
  } catch {
    return false;
  }
}

function buildPaletteRequestUrl(url: string): string {
  if (!import.meta.env.DEV || !isLocalOpeninaryBackground(url)) {
    return url;
  }

  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set('_theme_cache_bust', Date.now().toString());
  return parsedUrl.toString();
}

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
  isDark: boolean,
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
  private readonly THEME_LOADING_WARNING_TIMEOUT_MS = 4000;
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
        return new CustomThemeImpl(docsTheme);
      case 'default':
        return new CustomThemeImpl(defaultTheme);
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
    const paletteRequestUrl = buildPaletteRequestUrl(chosenBackground!);

    // Always extract the palette using Vibrant.
    let extractedPalette;
    try {
      // 1 - fetch image as blob to ensure CORS is handled correctly
      const abortController = new AbortController(); // to cancel fetch() if needed
      // warn ofter given time
      const warningTimer = setTimeout(() => {
        useInfoStore
          .getState()
          .setMessage(
            new SnackbarUpdateImpl(
              `Loading image for theme ${themeName} takes longer then expected`,
              'warning',
            ),
          );
      }, this.THEME_LOADING_WARNING_TIMEOUT_MS);
      // timer to allert controller after given time
      const timeoutId = setTimeout(() => {
        abortController.abort();
        useInfoStore
          .getState()
          .setMessage(
            new SnackbarUpdateImpl(
              `Failed to load image for theme ${themeName} with URL "${chosenBackground}". Using default Theme`,
              'error',
            ),
          );
      }, this.THEME_LOADING_WARNING_TIMEOUT_MS * 10);
      // actually execute the request
      const response = await fetch(paletteRequestUrl, {
        cache:
          import.meta.env.DEV && isLocalOpeninaryBackground(chosenBackground!)
            ? 'no-store'
            : 'default',
        mode: 'cors',
        redirect: 'follow',
        signal: abortController.signal,
      });
      clearTimeout(timeoutId); // clear timer

      // 2 - convert response to blob
      const blob = await response.blob();

      // 3 - create object URL from blob for Vibrant
      const objectUrl = URL.createObjectURL(blob);

      // 4 - create image and asign object URL as source for Vibrant
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Needed for CORS if images are on different domain
      img.src = objectUrl;

      // 5 - process image with vibrant to extract palette
      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = () => {
          clearTimeout(warningTimer);
          resolve(img);
        };
        img.onerror = (e) => {
          clearTimeout(warningTimer);
          reject(e);
          useInfoStore
            .getState()
            .setMessage(
              new SnackbarUpdateImpl(
                `Failed to load image for theme ${themeName} with URL "${chosenBackground}". Using default Theme`,
                'error',
              ),
            );
        };
      });

      // Wait for the image to load, then process with Vibrant
      const loadedImg = await imageLoaded;
      extractedPalette = await Vibrant.from(
        loadedImg as HTMLImageElement,
      ).getPalette();
    } catch (err) {
      console.error('Error extracting colors with Node-Vibrant:', err);
      extractedPalette = {};
      return defaultTheme;
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

    // Build and return the full MUI theme.
    var theme = createTheme({
      shape: {
        borderRadius: '16px',
      },
      transitions: {
        duration: {
          complex: 500,
        },
      },
      palette: {
        contrastThreshold: 3.5,
        mode: this.isDark ? 'dark' : 'light',
        primary: {
          main: vibrantHex,
          light: lightVibrantHex,
          dark: darkVibrantHex,
        },
        secondary: {
          main: mutedHex,
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

    // calculates background colors, text colors and extends methods
    return new CustomThemeImpl(theme, undefined, true);
  }
}
