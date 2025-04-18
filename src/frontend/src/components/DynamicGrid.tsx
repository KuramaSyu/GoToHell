import React, { useState } from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { darken } from '@mui/material/styles';
import { animated, AnimatedProps, useSpring } from '@react-spring/web';

export interface GameItem {
  text: string;
  size: number;
}

export interface DynamicGameGridProps {
  items: string[];
  /**
   * Capacity per row at different breakpoints.
   * For example, { xs: 8, sm: 12, md: 20 }.
   */
  capacity: {
    xs: number;
    sm: number;
    md: number;
    lg?: number;
    xl?: number;
  };
  selectedItem?: string;
  onSelect: (itemText: string) => void;
}

/**
 * Pack items into rows based on a capacity (sum of sizes).
 * When adding the next item would exceed the capacity, a new row is started.
 */
const computeRows = (items: GameItem[], capacity: number): GameItem[][] => {
  const rows: GameItem[][] = [];
  let currentRow: GameItem[] = [];
  let currentSum = 0;

  items.forEach((item) => {
    // Always add at least one item in a row
    if (currentRow.length === 0 || currentSum + item.size <= capacity) {
      currentRow.push(item);
      currentSum += item.size;
    } else {
      rows.push(currentRow);
      currentRow = [item];
      currentSum = item.size;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
};

const AnimatedDiv = animated.div as React.FC<
  AnimatedProps<{ style: React.CSSProperties }> & { children: React.ReactNode }
>;
/**
 * A button with react-spring animation.
 */
const AnimatedButton: React.FC<{
  item: GameItem;
  isSelected: boolean;
  onClick: () => void;
}> = ({ item, isSelected, onClick }) => {
  // Animate opacity and scale on mount
  const spring = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 220, friction: 20 },
  });

  return (
    <AnimatedDiv style={spring}>
      <Button
        fullWidth
        variant={isSelected ? 'contained' : 'outlined'}
        onClick={onClick}
        sx={{
          fontSize: 'clamp(12px, 1.5vw, 32px)',
          padding: 2,
          border: '2px solid',
          borderColor: 'secondary.main',
          backgroundColor: isSelected ? undefined : 'transparent',
          color: 'text.primary',
          fontWeight: 'bold',
          height: '100%',
          '&:hover': {
            backgroundColor: (theme) => darken(theme.palette.primary.main, 0.2),
            borderColor: (theme) => darken(theme.palette.secondary.main, 0.2),
          },
        }}
      >
        {item.text}
      </Button>
    </AnimatedDiv>
  );
};

/**
 * A responsive grid that packs GameItems into rows based on a total capacity.
 * Items in a row are resized (by width percentage) proportionally so that together they span the full row.
 */
export const DynamicGameGrid: React.FC<DynamicGameGridProps> = ({
  items,
  capacity,
  onSelect,
  selectedItem,
}) => {
  const [currentItem, setItem] = useState<String | null>();
  const currentmixItem = currentItem || selectedItem;
  const theme = useTheme();
  let game_items: GameItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const gameitem: GameItem = {
      text: items[i]!,
      size: items[i]!.length,
    };
    game_items.push(gameitem);
  }
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  // Determine the current row capacity based on screen size.
  let currentCapacity;
  if (isXlUp) {
    if (capacity.xl !== undefined) {
      currentCapacity = capacity.xl;
    } else if (capacity.lg !== undefined) {
      currentCapacity = capacity.lg;
    } else {
      currentCapacity = capacity.md;
    }
  } else if (isLgUp) {
    if (capacity.lg !== undefined) {
      currentCapacity = capacity.lg;
    } else {
      currentCapacity = capacity.md;
    }
  } else if (isMdUp) {
    currentCapacity = capacity.md;
  } else if (isSmUp) {
    currentCapacity = capacity.sm;
  } else {
    currentCapacity = capacity.xs;
  }

  // Compute the rows based on the items' sizes and current capacity.
  const rows = computeRows(game_items, currentCapacity);

  return (
    <Box width="100%" height="100%" sx={{ p: 0 }}>
      {rows.map((row, rowIndex) => {
        // Calculate the sum of sizes for the current row.
        const totalSize = row.reduce((sum, item) => sum + item.size, 0);
        return (
          <Box key={`row-${rowIndex}`} display="flex" width="100%" mb={2}>
            {row.map((item) => {
              // Determine width percentage so that the row fills 100%.
              const widthPercent = (item.size / totalSize) * 100;
              return (
                <Box key={item.text} sx={{ width: `${widthPercent}%`, px: 1 }}>
                  <AnimatedButton
                    item={item}
                    isSelected={currentmixItem === item.text}
                    onClick={() => {
                      setItem(item.text);
                      onSelect(item.text);
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
