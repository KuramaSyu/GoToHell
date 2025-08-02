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

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      sx={{
        height: 100,
        width: 'auto',
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        marginBottom: 1,
        cursor: 'grab',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignContent: 'center',
          alignItems: 'stretch',
          height: '100%',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <Typography sx={{ alignContent: 'center' }}>
          {entry.displayName()}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Divider orientation="vertical" flexItem />
          {entry.isDisplayed ? (
            <PushPinIcon
              sx={{ cursor: 'pointer' }}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
              onClick={() => {
                alterElement(entry.cloneWith({ isDisplayed: false }));
              }}
            />
          ) : (
            <PushPinOutlinedIcon
              sx={{ cursor: 'pointer' }}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
              onClick={() => {
                alterElement(entry.cloneWith({ isDisplayed: true }));
              }}
            />
          )}
        </Box>
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
