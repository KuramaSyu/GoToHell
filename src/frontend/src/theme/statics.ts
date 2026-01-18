import { alpha } from "@mui/material";
import { CustomTheme } from "./customTheme";

export const BoxElevation1 = (theme: CustomTheme) => ({
  backgroundColor: alpha(theme.palette.muted.dark, 0.6),
  backdropFilter: "blur(16px)",
});

export const BoxElevation2 = (theme: CustomTheme) => ({
  backgroundColor: alpha(theme.palette.muted.dark, 0.3),
  backdropFilter: "blur(8px)",
});
