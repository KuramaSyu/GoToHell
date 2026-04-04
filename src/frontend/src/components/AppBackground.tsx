import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';

/**
 * Fullscreen app background layer.
 *
 * Behavior:
 * - Reads the active background image from the current theme.
 * - Cross-fades between the previous and next background when the theme image changes.
 * - Uses `theme.transitions.duration.complex` for timing.
 *   The duration can be pre-adjusted in `useThemeStore.setTheme(...)`
 *   to make the next theme/background transition globally slower or faster.
 *
 * Rendering notes:
 * - This component is purely visual and returns `null` if no background image exists.
 * - The wrapper `Box` is fixed and sits behind all app content (`zIndex: 0`).
 */
const AppBackground: React.FC = () => {
  const { theme } = useThemeStore();
  const backgroundImage = theme?.custom?.backgroundImage;

  const [currentImage, setCurrentImage] = useState<string | null>(
    backgroundImage,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const complexDuration = Math.min(
    theme.transitions.duration.complex,
    2000, // Cap to avoid excessively long transitions if the theme sets a very high value.
  );

  useEffect(() => {
    if (backgroundImage && backgroundImage !== currentImage) {
      // Trigger fade out/in effect
      // Only start a transition if the theme points to a different image.
      const switchDelayMs = complexDuration / 3;
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setCurrentImage(backgroundImage);
        setIsTransitioning(false);
      }, switchDelayMs); // Match this with your CSS transition time

      return () => clearTimeout(timer);
    }
  }, [backgroundImage, currentImage, complexDuration]);

  if (!backgroundImage) return null;

  return (
    <Box
      sx={{
        position: 'fixed', // Fixed is usually better for app backgrounds
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, // Keep it behind everything
        backgroundColor: theme.palette.background.default, // Fallback color
        overflow: 'hidden',
      }}
    >
      {/* The Actual Background Image */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${currentImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(9px)',
          // transition: 'opacity 300ms ease-in-out', // The CSS Magic
          transition: theme.transitions.create('opacity', {
            duration: 2 * (complexDuration / 3),
            // easing: theme.transitions.easing.easeOut,
          }),
          opacity: isTransitioning ? 0 : 1, // Fades out then back in
        }}
      />
    </Box>
  );
};

export default AppBackground;
