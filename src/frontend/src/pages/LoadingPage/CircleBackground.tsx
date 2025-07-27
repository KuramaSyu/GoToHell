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
}

const MotionBox = motion(Box);

export const ExpandingCircleBackground: React.FC<
  ExpandingCircleBackgroundProps
> = ({ color, duration, delay, initialOpacity, animateOpacity }) => {
  return (
    <AnimatePresence>
      <MotionBox
        initial={{
          clipPath: 'circle(0% at 50% 50%)',
          opacity: initialOpacity ?? 1,
        }}
        animate={{
          clipPath: 'circle(100% at 50% 50%)',
          opacity: animateOpacity ?? 1,
        }}
        transition={{
          duration: duration,
          ease: 'easeInOut',
          delay: delay ?? 0,
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: color,
          // include the vendor prefix in sx:
          WebkitClipPath: 'circle(0% at 50% 50%)',
        }}
      />
    </AnimatePresence>
  );
};
