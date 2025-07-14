import { Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  duration?: number; // new prop added to control animation duration
  circular?: boolean;
}

const AnimatedButton = ({
  children,
  onClick,
  duration = 10,
  circular = false,
}: AnimatedButtonProps) => {
  const theme = useTheme();

  const isAnimationActive = duration !== 0;

  const AnimatedBtn = styled(motion.create(Button))({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    borderWidth: '3px', // increased outline width
    color: theme.palette.common.white,
    fontWeight: 'bold',
    background: isAnimationActive
      ? circular
        ? `conic-gradient(from 0deg, 
            ${theme.palette.secondary.light}, 
            ${theme.palette.secondary.main}, 
            ${theme.palette.secondary.dark}, 
            ${theme.palette.primary.light}, 
            ${theme.palette.primary.main}, 
            ${theme.palette.primary.dark}, 
            ${theme.palette.secondary.light}
            )`
        : `linear-gradient(90deg, 
          ${theme.palette.secondary.light}, 
          ${theme.palette.secondary.main}, 
          ${theme.palette.secondary.dark}, 
          ${theme.palette.secondary.main},
          ${theme.palette.primary.light}, 
          ${theme.palette.primary.main}, 
          ${theme.palette.primary.dark}, 
          ${theme.palette.primary.main}
          )`
      : 'transparent',
    backgroundSize: isAnimationActive ? '900% 100%' : '100% 100%',
  });

  return (
    <AnimatedBtn
      {...(isAnimationActive
        ? {
            animate: {
              backgroundPosition: ['0% 50%', '100% 50%', '200% 50%', '0% 50%'],
            },
            transition: { duration, repeat: Infinity, ease: 'easeInOut' },
          }
        : {})}
      variant={isAnimationActive ? 'contained' : 'outlined'}
      onClick={onClick}
    >
      {children}
    </AnimatedBtn>
  );
};

export const AnimatedRoundBtn = ({
  children,
  onClick,
  duration = 10,
}: AnimatedButtonProps) => {
  const theme = useTheme();

  const isAnimationActive = duration !== 0;

  const RoundBtn = styled(motion.create(Button))({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    borderWidth: '3px',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    background: isAnimationActive
      ? `conic-gradient(from 0deg, 
          ${theme.palette.secondary.light}, 
          ${theme.palette.secondary.main}, 
          ${theme.palette.secondary.dark}, 
          ${theme.palette.primary.light}, 
          ${theme.palette.primary.main}, 
          ${theme.palette.primary.dark}, 
          ${theme.palette.secondary.light}
          )`
      : 'transparent',
  });

  return (
    <RoundBtn
      {...(isAnimationActive
        ? {
            animate: {
              backgroundPosition: ['0% 50%', '100% 50%', '200% 50%', '0% 50%'],
            },
            transition: { duration, repeat: Infinity, ease: 'linear' },
          }
        : {})}
      variant={isAnimationActive ? 'contained' : 'outlined'}
      onClick={onClick}
    >
      {children}
    </RoundBtn>
  );
};
export default AnimatedButton;
