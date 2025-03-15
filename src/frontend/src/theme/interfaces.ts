export interface CustomThemeConfig {
  name: string; // Short identifier, e.g. 'ocean'
  longName: string; // Descriptive name, e.g. 'Ocean Breeze'
  backgrounds: string[];
  // Optional overrides – if provided these will be used instead of Vibrant extraction.
  primary?: string;
  secondary?: string;
}
