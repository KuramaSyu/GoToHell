import { ThemeManager } from './themeManager';
import { customThemes, useThemeStore } from '../zustand/useThemeStore';
import { CustomThemeConfig } from './interfaces';

const themeManager = new ThemeManager(customThemes);

/**
 * Asynchronously sets the current theme by name.
 * It always executes Vibrant extraction on the background image,
 * then generates a full theme (including all vibrant swatches) and updates the zustand store.
 */
// export async function setCustomTheme(themeName: string): Promise<void> {
//   const newTheme = await themeManager.generateTheme(themeName);
//   if (newTheme) {
//     useThemeStore.getState().setTheme(newTheme);
//   } else {
//     console.error(`Unable to set theme: ${themeName}`);
//   }
// }
