import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { SearchEntry } from '../../QuickActions/SearchModal';
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

export const SelectionElement: React.FC<{ entry: SearchEntry }> = ({
  entry,
}) => {
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

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      sx={{
        height: 100,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        marginBottom: 1,
      }}
    >
      <CardContent>
        <Typography>{entry.displayName()}</Typography>
      </CardContent>
    </Card>
    // <Box
    //   sx={{
    //     width: '100px',
    //     height: '50px',
    //     backgroundColor: 'transparent',
    //     borderRadius: 5,
    //     borderColor: theme.palette.primary.main,
    //     borderWidth: 1,
    //   }}
    // >
    //   {entry.displayName()}
    // </Box>
  );
};
