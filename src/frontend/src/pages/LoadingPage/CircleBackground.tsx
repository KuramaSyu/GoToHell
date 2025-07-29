import { Box, darken } from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CustomTheme } from '../../theme/customTheme';

export interface ExpandingCircleBackgroundProps {
  color: string;
  duration: number;
  delay?: number;
  initialOpacity?: number;
  animateOpacity?: number;
  initialScale?: number;
  expansionScale?: number;
  initialAtXPercent?: number; // new: X position for initial "at"
  initialAtYPercent?: number; // new: Y position for initial "at"
  animateAtXPercent?: number; // new: X position for animate "at"
  animateAtYPercent?: number; // new: Y position for animate "at"
}

const MotionBox = motion(Box);

export const ExpandingCircleBackground: React.FC<
  ExpandingCircleBackgroundProps
> = ({
  color,
  duration,
  delay,
  initialOpacity,
  animateOpacity,
  initialScale,
  expansionScale,
  initialAtXPercent,
  initialAtYPercent,
  animateAtXPercent,
  animateAtYPercent,
}) => {
  // Defaults for at positions
  const initialAtX = initialAtXPercent ?? 0;
  const initialAtY = initialAtYPercent ?? 0;
  const animateAtX = animateAtXPercent ?? 0;
  const animateAtY = animateAtYPercent ?? 100;
  const initialScaleValue = initialScale ?? 0;

  return (
    <AnimatePresence>
      <MotionBox
        initial={{
          clipPath: `circle(${initialScaleValue}% at ${initialAtX}% ${initialAtY}%)`,
          opacity: initialOpacity ?? 1,
        }}
        animate={{
          clipPath: `circle(${
            expansionScale ?? 100
          }% at ${animateAtX}% ${animateAtY}%)`,
          opacity: animateOpacity ?? 1,
        }}
        transition={{
          duration: duration,
          // ease: [x1, y1, x2, y2] - cubic-bezier control points for animation timing curve
          // x1, y1: start control point; x2, y2: end control point
          // Higher y1 = faster start, higher y2 = faster end
          ease: [0.4, 0, 0.2, 1], // cubic-bezier for a smoother, more natural feel
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: color,
          // include the vendor prefix in sx:
          WebkitClipPath: `circle(0% at ${initialAtX}% ${initialAtY}%)`,
        }}
      />
    </AnimatePresence>
  );
};

export interface StaticCircleBackgroundProps {
  color: string;
  sizePercent?: number; // circle size as percent of container
  atXPercent?: number; // X position for "at"
  atYPercent?: number; // Y position for "at"
  opacity?: number;
}

export const StaticCircleBackground: React.FC<StaticCircleBackgroundProps> = ({
  color,
  sizePercent = 50,
  atXPercent = 50,
  atYPercent = 50,
  opacity = 1,
}) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: color,
      opacity,
      clipPath: `circle(${sizePercent}% at ${atXPercent}% ${atYPercent}%)`,
      WebkitClipPath: `circle(${sizePercent}% at ${atXPercent}% ${atYPercent}%)`,
      pointerEvents: 'none', // optional: let clicks pass through
    }}
  />
);
