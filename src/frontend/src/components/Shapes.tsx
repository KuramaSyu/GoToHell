import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import HexagonRoundedIcon from '@mui/icons-material/HexagonRounded';
interface StarProps {
  round?: string;
  color?: string;
  children?: React.ReactNode;
  padding?: number; // Extra padding around the child
}

export default function Hexagon({
  round = '0px',
  color = 'white',
  children,
  padding = 50, // Default padding around the child
}: StarProps) {
  const childRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 140, height: 140 });

  useEffect(() => {
    if (childRef.current) {
      const childWidth = childRef.current.offsetWidth;
      const childHeight = childRef.current.offsetHeight;
      const max = Math.max(childWidth, childHeight);

      // Adjust hexagon size based on child size + padding
      setDimensions({
        width: max + padding,
        height: max + padding,
      });
    }
  }, [children, padding]);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: round,
      }}
    >
      <SvgIcon
        component={HexagonRoundedIcon}
        sx={{
          position: 'absolute',
          zIndex: 0,
          color: color,
          width: dimensions.width,
          height: dimensions.height,
        }}
      ></SvgIcon>

      <Box
        ref={childRef}
        sx={{
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
