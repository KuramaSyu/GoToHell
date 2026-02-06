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
  IconButton,
  lighten,
  Stack,
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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';

/**
 * A decorator for SearchEntry, which calls a close function after selecting
 */
export class SelectAndCloseSeachEntry implements SearchEntry {
  wrapped: SearchEntry;
  close_fn: () => void;
  name: string;
  isDisplayed: boolean;

  constructor(wrapped: SearchEntry, close_fn: () => void) {
    this.wrapped = wrapped;
    this.close_fn = close_fn;
    this.name = wrapped.name;
    this.isDisplayed = wrapped.isDisplayed;
  }

  select(): void {
    this.wrapped.select();
    this.close_fn();
  }
  displayName(): string {
    return this.wrapped.displayName();
  }
  getNames(): string[] {
    return this.wrapped.getNames();
  }
  setIsDisplayed(isDisplayed: boolean): void {
    this.wrapped.setIsDisplayed(isDisplayed);
  }
  cloneWith(changes: Partial<SearchEntry>): SearchEntry {
    return this.wrapped.cloneWith(changes);
  }
}

/**
 * Represents an Element used in the Selection Dialog
 */
export const SelectionElement: React.FC<{
  entry: SearchEntry;
  alterElement: (entry: SearchEntry) => void;
  onElementUp: (e: SearchEntry) => void;
  onElementDown: (e: SearchEntry) => void;
  onElementToFirst: (e: SearchEntry) => void;
  onElementToLast: (e: SearchEntry) => void;
}> = ({
  entry,
  alterElement,
  onElementUp,
  onElementDown,
  onElementToFirst,
  onElementToLast,
}) => {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
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
      }}
    >
      {/* Selection indicator and drag handle */}
      {isMobile ? (
        <Stack direction={'row'}>
          <Stack
            direction='column'
            width={40}
            justifyContent={'center'}
            zIndex={2}
            sx={{
              backgroundColor: alpha(
                theme.blendAgainstContrast('primary', 0.3),
                0.2,
              ),
            }}
          >
            <IconButton onClick={() => onElementUp(entry)}>
              <KeyboardArrowUpIcon />
            </IconButton>
            <IconButton onClick={() => onElementDown(entry)}>
              <KeyboardArrowDownIcon />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
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
          <DragIndicatorIcon color='inherit' />
        </Box>
      )}
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
          p: 1,
        }}
      >
        <Stack direction='row' alignItems={'center'} zIndex={2}>
          {isMobile && (
            <>
              <IconButton onClick={() => onElementToFirst(entry)}>
                <KeyboardDoubleArrowUpIcon />
              </IconButton>
              <IconButton onClick={() => onElementToLast(entry)}>
                <KeyboardDoubleArrowDownRoundedIcon />
              </IconButton>
            </>
          )}

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
        </Stack>
      </Box>
    </Card>
  );
};
