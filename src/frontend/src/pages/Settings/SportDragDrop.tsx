import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Box, Typography, alpha } from '@mui/material';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import zIndex from '@mui/material/styles/zIndex';
import { useThemeStore } from '../../zustand/useThemeStore';

// Item component with forwardRef
const SortableItem = ({ id }: { id: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: 3,
  };

  return (
    <Paper
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      sx={{ p: 2, mb: 1, cursor: 'grab' }}
    >
      {id}
    </Paper>
  );
};

const ListSX = {
  borderRadius: 3,
  minWidth: 200,
  minHeight: 500,
  p: 1,
};
export const SportDragDrop = () => {
  const { sportResponse } = useSportResponseStore();
  const { theme } = useThemeStore();
  const [listA, setListA] = useState(Object.keys(sportResponse?.sports ?? {}));
  const [listB, setListB] = useState<string[]>(['A']);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const findList = (id: string): 'A' | 'B' | null => {
    if (listA.includes(id)) return 'A';
    if (listB.includes(id)) return 'B';
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeList = findList(active.id as string);
    const overList = findList(over.id as string);

    if (!activeList || !overList) return;

    // Remove from original list
    const sourceList = activeList === 'A' ? listA : listB;
    const targetList = overList === 'A' ? listA : listB;
    const setSourceList = activeList === 'A' ? setListA : setListB;
    const setTargetList = overList === 'A' ? setListA : setListB;

    if (activeList === overList) {
      const oldIndex = sourceList.indexOf(active.id as string);
      const newIndex = sourceList.indexOf(over.id as string);
      const newList = arrayMove(sourceList, oldIndex, newIndex);
      setSourceList(newList);
    } else {
      // Move item between lists
      const newSource = sourceList.filter((item) => item !== active.id);
      const overIndex = targetList.indexOf(over.id as string);
      const newTarget = [
        ...targetList.slice(0, overIndex),
        active.id as string,
        ...targetList.slice(overIndex),
      ];
      setSourceList(newSource);
      setTargetList(newTarget);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => setActiveId(event.active.id as string)}
    >
      <DragOverlay>
        {activeId ? <SortableItem id={activeId}></SortableItem> : null}
      </DragOverlay>
      <Box display="flex" gap={4}>
        {/* List A */}
        <Box
          sx={{
            ...ListSX,
            backgroundColor: alpha('#000000', 0.2),
          }}
        >
          <Typography variant="h6">Available Sportkinds</Typography>
          <SortableContext items={listA} strategy={verticalListSortingStrategy}>
            {listA.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </SortableContext>
        </Box>

        {/* List B */}
        <Box
          sx={{
            ...ListSX,
            backgroundColor: alpha('#000000', 0.2),
          }}
        >
          <Typography variant="h6">Shown Sportkinds</Typography>
          <SortableContext items={listB} strategy={verticalListSortingStrategy}>
            {listB.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </SortableContext>
        </Box>
      </Box>
    </DndContext>
  );
};
