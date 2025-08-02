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
import { Grid } from '@mui/material';

import { SearchEntry } from '../../QuickActions/SearchModal';
import { useState } from 'react';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import { useThemeStore } from '../../../../zustand/useThemeStore';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
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
  const [copyList, setCopyList] = useState<SearchEntry[]>(list);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = copyList.findIndex((entry) => entry.name === active.id);
      const newIndex = copyList.findIndex((entry) => entry.name === over?.id);
      const newList = arrayMove(copyList, oldIndex, newIndex);
      setCopyList(newList);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        saveChange(copyList);
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
      fullScreen={isMobile}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={copyList.map((entry) => entry.name)}
            strategy={rectSortingStrategy}
          >
            <Box>
              <Grid container spacing={2}>
                {copyList.map((entry) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                    key={entry.name}
                  >
                    <SelectionElement entry={entry} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </SortableContext>
        </DndContext>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            saveChange(copyList);
            setOpen(false);
          }}
          color="primary"
        >
          Save & Close
        </Button>
        <DialogActions />
      </DialogActions>
    </Dialog>
  );
};
