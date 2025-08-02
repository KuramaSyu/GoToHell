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
import { SelectionElement } from './SelectionElement';

export interface SelectionDialogProps {
  title: string;
  list: SearchEntry[];
  saveChange: (list: SearchEntry[]) => void;
  state: DialogStateProps;
}

export interface DialogStateProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SelectionDialog: React.FC<SelectionDialogProps> = ({
  title,
  list,
  saveChange,
  state: { open, setOpen },
}) => {
  const { isMobile } = useBreakpoint();
  const { theme } = useThemeStore();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: isMobile ? '100vw' : '80vw',
        height: isMobile ? '90vh' : '80vh',
        // display: 'flex',
      }}
    >
      <Dialog
        open={open}
        onClose={() => {
          saveChange(list);
          setOpen(false);
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: isMobile ? '100%' : '80%',
            height: isMobile ? '100%' : '80%',
            maxWidth: 'none',
            maxHeight: 'none',
          },
        }}
        slotProps={{
          paper: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: alpha(theme.palette.muted.dark, 0.7),
              borderRadius: 8,
            },
          },
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DndContext sensors={sensors}>
            <SortableContext
              items={list.map((entry) => entry.name)}
              strategy={rectSortingStrategy}
            >
              <Box>
                {list.map((entry) => (
                  <Box key={entry.name}>
                    <SelectionElement entry={entry} />
                  </Box>
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Close
          </Button>
          <DialogActions />
        </DialogActions>
      </Dialog>
    </Box>
  );
};
