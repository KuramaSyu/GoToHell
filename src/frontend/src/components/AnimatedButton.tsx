import { Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { darken, keyframes, styled } from '@mui/system';
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
      ? `linear-gradient(90deg, 
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
      disabled={!isAnimationActive}
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

  const spin = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `;

  const RoundBtn = styled(motion.create(Button))({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: 'none',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    background: 'transparent', // The button itself is transparent
    // Ensure children are on top of pseudo-elements
    '& > *': {
      zIndex: 2,
      position: 'relative', // Ensure children stay on top
    },
    // Spinning gradient ring
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `conic-gradient(
        ${theme.palette.primary.main},
        ${theme.palette.secondary.main},
        ${theme.palette.primary.dark},
        ${theme.palette.secondary.dark},
        ${theme.palette.primary.main}
      )`,
      zIndex: 0,
      animation: isAnimationActive
        ? `${spin} ${duration}s ease infinite`
        : 'none',
    },
    // Solid black center circle
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      background:
        'radial-gradient(circle, rgba(0,0,0,0.7) 0%,  rgba(0,0,0,0) 65%)',
      borderRadius: '50%',
      zIndex: 1,
    },
  });

  return (
    <RoundBtn onClick={onClick} disabled={!isAnimationActive}>
      {children}
    </RoundBtn>
  );
};
export default AnimatedButton;
