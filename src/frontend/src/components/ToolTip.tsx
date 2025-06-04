import { SxProps } from '@mui/material';
import { Box, Theme } from '@mui/system';
import React, { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { NUMBER_FONT } from '../statics';

interface ToolTipProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  //**negative px values move it up */
  topPosition?: string | number;
  topBarHeight?: number;
  cssId?: string;
}

const DEFAULT_TOP_BAR_HEIGHT = 90; // Example: Adjust if your TopBar height differs
const TOOLTIP_ANCHOR_GAP = 8; // Gap in pixels when repositioning below anchor

export const ToolTip: React.FC<ToolTipProps> = ({
  children,
  sx,
  topPosition: initialTopPosition = '-40px',
  topBarHeight = DEFAULT_TOP_BAR_HEIGHT,
  cssId = 'hoverBox',
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [calculatedTopCssValue, setCalculatedTopCssValue] = useState<
    string | number
  >(initialTopPosition);

  // changes topPosition, so that it does not colide with the TopBar
  useLayoutEffect(() => {
    if (!tooltipRef.current || !tooltipRef.current.parentElement) {
      return;
    }

    const tooltipElement = tooltipRef.current;
    const anchorElement = tooltipRef.current.parentElement;

    // Attempt to parse the initialTopPosition to a numerical offset
    // Assumes 'px' unit or a raw number.
    const initialTopOffset = parseFloat(
      String(initialTopPosition).replace(/px$/, '')
    );

    if (isNaN(initialTopOffset)) {
      // If parsing fails, fallback to initial prop value without adjustment
      setCalculatedTopCssValue(initialTopPosition);
      return;
    }

    const anchorRect = anchorElement.getBoundingClientRect();

    // Calculate the tooltip's absolute top Y coordinate in the viewport
    // if it were placed according to initialTopOffset relative to the anchor's top.
    const tooltipViewportY = anchorRect.top + initialTopOffset;

    // Check for collision:
    // 1. Was the tooltip intended to be above the anchor (initialTopOffset < 0)?
    // 2. Would its top edge be above or behind the topBarHeight?
    if (initialTopOffset < 0 && tooltipViewportY < topBarHeight) {
      // Collision detected. Reposition tooltip below the anchor.
      // New top is anchor's height + a small gap.
      const newTopBelowAnchor = anchorElement.offsetHeight + TOOLTIP_ANCHOR_GAP;
      setCalculatedTopCssValue(`${newTopBelowAnchor}px`);
    } else {
      // No collision, or not positioned above: use the initial/prop value.
      setCalculatedTopCssValue(initialTopPosition);
    }
  }, [initialTopPosition, topBarHeight]); // Rerun if these props change

  return (
    <Box
      ref={tooltipRef}
      className={cssId}
      sx={{
        position: 'absolute',
        top: calculatedTopCssValue,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        color: 'white',
        px: 2,
        py: 2,
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        fontSize: 14,
        whiteSpace: 'nowrap',
        opacity: 0,
        visibility: 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease',
        zIndex: 1300,
        fontFamily: NUMBER_FONT,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
