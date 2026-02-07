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
  outlinedInputClasses,
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

  /**
   * used by dnd after a dragged element was dropped.
   * @param event the drag end evnent
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = copyList.findIndex((entry) => entry.name === active.id);
      const newIndex = copyList.findIndex((entry) => entry.name === over?.id);
      const newList = arrayMove(copyList, oldIndex, newIndex);
      setCopyList(newList);
    }
  };

  /**
   * used from cards, if up/down was clicked on mobile
   * since touch is disabled there. Hence an alternative
   * to dnd use
   * @param entry the entry to move
   * @param direction 1 up or 1 down
   */
  const onEntryMove = (
    entry: SearchEntry,
    direction: 'up' | 'down' | 'first' | 'last',
  ) => {
    console.log(`element move: ${direction}`);
    const oldIdex = copyList.findIndex((e) => entry.name === e.name);
    const first = 0;
    const last = copyList.length - 1;
    var newIndex = oldIdex;
    switch (direction) {
      case 'up':
        newIndex--;
      case 'down':
        newIndex++;
      case 'first':
        newIndex = first;
      case 'last':
        newIndex = last;
    }
    const newList = arrayMove(copyList, oldIdex, newIndex);
    setCopyList(newList);
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
        // borderRadius: 2,
      }}
      slotProps={{
        paper: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.muted.dark, 0.7),
            borderRadius: 2,
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
                      onElementUp={(e) => onEntryMove(e, 'up')}
                      onElementDown={(e) => onEntryMove(e, 'down')}
                      onElementToFirst={(e) => onEntryMove(e, 'first')}
                      onElementToLast={(e) => onEntryMove(e, 'last')}
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
