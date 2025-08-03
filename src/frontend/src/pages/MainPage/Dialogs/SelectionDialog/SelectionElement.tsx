import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  lighten,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import { useThemeStore } from '../../../../zustand/useThemeStore';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { SearchEntry } from '../../QuickActions/SearchEntry';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { SearchEntryIconProvider } from '../../QuickActions/SearchEntryIconProvider';
import { blendWithContrast } from '../../../../utils/blendWithContrast';

export const SelectionElement: React.FC<{
  entry: SearchEntry;
  alterElement: (entry: SearchEntry) => void;
}> = ({ entry, alterElement }) => {
  const { theme } = useThemeStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.name });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: 3,
  };

  const icon = SearchEntryIconProvider.getIcon(entry, {
    width: 40,
    height: 40,
    filter: 'brightness(0) invert(0.8)',
  });
  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        position: 'relative',
        height: 100,
        width: 'auto',
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        marginBottom: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        boxShadow: isDragging ? 6 : 1,
        //transition: 'box-shadow 0.2s, transform 0.2s', // Add transition
        // '&:hover': {
        //   boxShadow: 8,
        //   transform: 'scale(1.02)', // Slightly scale up on hover
        // },
      }}
    >
      {/* Selection indicator and drag handle */}
      <Box
        sx={{
          width: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.33),
          borderRight: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
          cursor: 'grab',
          userSelect: 'none',
          color: blendWithContrast(theme.palette.primary.main, theme, 1 / 2),
        }}
        {...attributes}
        {...listeners}
      >
        <DragIndicatorIcon color="inherit" />
      </Box>
      {/* Card content */}
      <CardContent
        onClick={() => entry.select()}
        sx={{
          display: 'flex',
          alignContent: 'space-evenly',
          alignItems: 'center',
          height: '100%',
          justifyContent: 'space-between',
          flexDirection: 'row',
          flex: 1,
          pl: 2,
          //transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.25),
          },
          cursor: 'pointer',
        }}
      >
        <Typography sx={{ alignContent: 'center', cursor: 'inherit' }}>
          {entry.displayName()}
        </Typography>

        {icon !== null && <Box sx={{ mx: 1, width: '40px' }}>{icon}</Box>}
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          p: 1, // optional: padding from the edge
          //pointerEvents: 'none', // allow clicks to pass through except for the icon
        }}
      >
        {entry.isDisplayed ? (
          <PushPinIcon
            sx={{
              cursor: 'pointer',
              transition: 'color 0.2s, background 0.2s',
              '&:hover': {
                color: lighten(theme.palette.primary.main, 0.5),
                background: alpha(theme.palette.muted.main, 0.5),
                borderRadius: '50%',
              },
            }}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
            onClick={() => {
              alterElement(entry.cloneWith({ isDisplayed: false }));
            }}
          />
        ) : (
          <PushPinOutlinedIcon
            sx={{
              cursor: 'pointer',
              transition: 'color 0.2s, background 0.2s',
              '&:hover': {
                color: lighten(theme.palette.primary.main, 0.5),
                background: alpha(theme.palette.muted.main, 0.5),
                borderRadius: '50%',
              },
            }}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
            onClick={() => {
              alterElement(entry.cloneWith({ isDisplayed: true }));
            }}
          />
        )}
      </Box>
    </Card>
  );
};
