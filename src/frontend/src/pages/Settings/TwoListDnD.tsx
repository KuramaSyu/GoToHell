import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDroppable,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Box, Typography, alpha, Grid } from '@mui/material';
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
  backgroundColor: alpha('#000000', 0.2),
};

export interface TwoListDnDProps {
  listA: string[];
  setListA: React.Dispatch<React.SetStateAction<string[]>>;
  listB: string[];
  setListB: React.Dispatch<React.SetStateAction<string[]>>;
  nameA: string;
  nameB: string;
  saveChange: (listA: string[], listB: string[]) => void;
}

export const TwoListDnD: React.FC<TwoListDnDProps> = ({
  listA,
  setListA,
  listB,
  setListB,
  saveChange,
  nameA,
  nameB,
}) => {
  const { theme } = useThemeStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  /**
   * Save changes with the outside function
   */
  useEffect(() => {
    saveChange(listA, listB);
  }, [listA, listB]);

  /**
   * Determines which list ('A' or 'B') contains the specified ID.
   *
   * @param id - The unique identifier to search for in the lists.
   * @returns `'A'` if the ID is found in `listA`, `'B'` if the ID is found in `listB`,
   * or `null` if the ID is not found in either list.
   */
  const findList = (id: string): 'A' | 'B' | null => {
    if (listA.includes(id)) return 'A';
    if (listB.includes(id)) return 'B';
    return null;
  };

  /**
   * @returns True, if the list does NOT contain the item.
   */
  const PreventDoublePredicate = (item: string, list: string[]): Boolean => {
    return !list.includes(item);
  };
  /**
   * Moves a dragged element from source to destination list. If source and destination
   * are the same, then just move the item. It prevents, that an element exists multiple times in a list.
   *
   * @param event the event
   * @returns void
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const pred = PreventDoublePredicate;

    if (!over) return;

    var activeList = findList(active.id as string); // source list
    var overList = findList(over.id as string); // destination list

    if (over.id === 'listB' || over.id === 'listA') {
      activeList = over.id === 'listB' ? 'A' : 'B';
      overList = over.id === 'listB' ? 'B' : 'A';
    }

    // get setters and getters
    const sourceList = activeList === 'A' ? listA : listB;
    const targetList = overList === 'A' ? listA : listB;
    const setSourceList = activeList === 'A' ? setListA : setListB;
    const setTargetList = overList === 'A' ? setListA : setListB;

    if (activeList === overList) {
      // replace with the new index
      const oldIndex = sourceList.indexOf(active.id as string);
      const newIndex = sourceList.indexOf(over.id as string);
      const newList = arrayMove(sourceList, oldIndex, newIndex);
      setSourceList(newList);
    } else {
      // Move item between lists
      // return if item is already in that list
      if (pred(active.id as string, targetList) === false) return;
      const newSource = sourceList.filter((item) => item !== active.id);
      const overIndex =
        targetList.length == 0 ? 0 : targetList.indexOf(over.id as string);
      const newTarget = [
        ...targetList.slice(0, overIndex),
        active.id as string,
        ...targetList.slice(overIndex),
      ];
      setSourceList(newSource);
      setTargetList(newTarget);
    }
  };

  const centeredDropHereBox = (
    <Box
      sx={{
        alignContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Typography align={'center'}>Drop here</Typography>
    </Box>
  );

  // TODO: drag for empty target not working
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => setActiveId(event.active.id as string)}
    >
      {/* when an object is dragged, the object is recreated by ID. It looks the same */}
      <DragOverlay>
        {activeId ? <SortableItem id={activeId}></SortableItem> : null}
      </DragOverlay>
      <Box display="flex" gap={4}>
        {/* List A */}
        <Box sx={ListSX}>
          <Typography variant="h6">{nameA}</Typography>
          <DroppableArea id={'listA'}>
            <SortableContext
              items={listA}
              strategy={verticalListSortingStrategy}
            >
              {listA.length > 0
                ? listA.map((id) => <SortableItem key={id} id={id} />)
                : centeredDropHereBox}
            </SortableContext>
          </DroppableArea>
        </Box>

        {/* List B */}
        <Box sx={ListSX}>
          <Typography variant="h6">{nameB}</Typography>
          <DroppableArea id={'listB'}>
            <SortableContext
              items={listB}
              strategy={verticalListSortingStrategy}
            >
              {listB.length > 0
                ? listB.map((id) => <SortableItem key={id} id={id} />)
                : centeredDropHereBox}
            </SortableContext>
          </DroppableArea>
        </Box>
      </Box>
    </DndContext>
  );
};

export interface OnlyChildren {
  children: React.ReactNode;
  id: string;
}
export const DroppableArea: React.FC<OnlyChildren> = ({ children, id }) => {
  const [isOver, setIsOver] = useState(false);
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return <Box ref={setNodeRef}>{children}</Box>;
};
