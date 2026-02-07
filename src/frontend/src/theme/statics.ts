import { alpha } from '@mui/material';
import { CustomTheme } from './customTheme';

export const BoxElevation0 = (theme: CustomTheme) => ({
  backgroundColor: theme.palette.muted.dark,
  transition: theme.colorTransition.root.transition,
});

export const BoxElevation1 = (theme: CustomTheme) => ({
  backgroundColor: alpha(theme.palette.muted.dark, 0.6),
  backdropFilter: 'blur(16px)',
  transition: theme.colorTransition.root.transition,
});

export const BoxElevation2 = (theme: CustomTheme) => ({
  backgroundColor: alpha(theme.palette.muted.dark, 0.3),
  backdropFilter: 'blur(8px)',
  transition: theme.colorTransition.root.transition,
});

export const BoxHoverPropsTopBar = (theme: CustomTheme) => ({
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.blendAgainstContrast('secondary', 0.2), 0.8),
  },
});
