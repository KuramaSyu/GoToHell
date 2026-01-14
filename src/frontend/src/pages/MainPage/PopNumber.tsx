import { styled, Typography } from '@mui/material';
import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

const FrostedChar = styled(motion.span)({
  display: 'inline-block',
  position: 'relative',
  isolation: 'isolate', // new stacking context
  fontWeight: 800,
  // ↓ your size prop goes here (we’ll spread it below)
  backgroundColor: 'rgba(255,255,255,0.3)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',

  // ————————————————————————
  // THIS is the magic for Chrome/Safari:
  WebkitMaskImage: 'text', // mask the whole box to the text shape
  WebkitMaskMode: 'alpha', // use text alpha as mask
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  WebkitMaskSize: '100% 100%',

  color: 'transparent', // hide the fill
});

export const PopNumber = ({
  value,
  font,
  stiffness,
  damping,
  mass,
  fontsize,
  zeroPadding,
  style,
  fontweight,
}: {
  value: number;
  font?: string;
  damping: number;
  stiffness: number;
  mass: number;
  fontsize?: string;
  fontweight?: number;
  zeroPadding?: number;
  style?: React.CSSProperties;
}) => {
  // Start with an initial spring value (can be 0 or value)
  const springValue = useSpring(0, {
    stiffness: stiffness,
    damping: damping,
    mass: mass,
  });

  const [displayed, setDisplayed] = useState(value);

  // Update the spring's target when "value" changes.
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // Subscribe to changes using useMotionValueEvent.
  useMotionValueEvent(springValue, 'change', (v) => {
    setDisplayed(Math.round(v));
  });

  var str = displayed.toString();
  if (zeroPadding) {
    str = str.padStart(zeroPadding, '0');
  }
  const randomIndex =
    str.length > 0 ? Math.floor(Math.random() * str.length) : 0;

  return (
    <Typography
      component="span"
      color="textPrimary"
      style={{
        fontFamily: font,
        display: 'inline-block',
      }}
    >
      {str.split('').map((char, index) => (
        <motion.span
          key={index}
          style={{
            fontSize: fontsize ?? '12vh',
            fontWeight: fontweight ?? undefined,
            ...style,
          }}
        >
          {char}
        </motion.span>
      ))}
    </Typography>
  );
};
