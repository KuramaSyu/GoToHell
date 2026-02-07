import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useThemeStore } from '../zustand/useThemeStore';

const AppBackground: React.FC = () => {
  const { theme } = useThemeStore();
  const backgroundImage = theme?.custom?.backgroundImage;

  const [currentImage, setCurrentImage] = useState<string | null>(
    backgroundImage,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (backgroundImage && backgroundImage !== currentImage) {
      // Trigger fade out/in effect
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setCurrentImage(backgroundImage);
        setIsTransitioning(false);
      }, theme.transitions.duration.complex / 3); // Match this with your CSS transition time

      return () => clearTimeout(timer);
    }
  }, [backgroundImage, currentImage]);

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
            duration: 2 * (theme.transitions.duration.complex / 3),
            // easing: theme.transitions.easing.easeOut,
          }),
          opacity: isTransitioning ? 0 : 1, // Fades out then back in
        }}
      />
    </Box>
  );
};

export default AppBackground;
