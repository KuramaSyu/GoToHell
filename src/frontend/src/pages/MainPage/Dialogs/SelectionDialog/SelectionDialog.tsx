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
  lighten,
  Typography,
} from '@mui/material';
import { Grid } from '@mui/material';

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
import { SelectAndCloseSeachEntry, SelectionElement } from './SelectionElement';
import { SearchEntry } from '../../QuickActions/SearchEntry';

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
  const sensors = useSensors(useSensor(PointerSensor)); // no touch.

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = copyList.findIndex((entry) => entry.name === active.id);
      const newIndex = copyList.findIndex((entry) => entry.name === over?.id);
      const newList = arrayMove(copyList, oldIndex, newIndex);
      setCopyList(newList);
    }
  };

  const alterElement = (entry: SearchEntry) => {
    console.log('Altering entry:', entry);
    const newList = copyList.map((e) => {
      if (e.name === entry.name) {
        return entry;
      }
      return e;
    });
    setCopyList(newList);
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
                    key={entry.name + entry.isDisplayed}
                  >
                    <SelectionElement
                      entry={
                        // use a decorator for entry, which closes the dialog on select
                        new SelectAndCloseSeachEntry(entry, () =>
                          setOpen(false),
                        )
                      }
                      alterElement={alterElement}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </SortableContext>
        </DndContext>
      </DialogContent>
      <DialogActions sx={{ color: lighten(theme.palette.primary.main, 2 / 3) }}>
        <Button
          onClick={() => {
            saveChange(copyList);
            setOpen(false);
          }}
          color='inherit'
        >
          Save & Close
        </Button>
        <DialogActions />
      </DialogActions>
    </Dialog>
  );
};
