import { Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  duration?: number; // new prop added to control animation duration
}

const AnimatedButton = ({
  children,
  onClick,
  duration = 10,
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
    >
      {children}
    </AnimatedBtn>
  );
};

export default AnimatedButton;
