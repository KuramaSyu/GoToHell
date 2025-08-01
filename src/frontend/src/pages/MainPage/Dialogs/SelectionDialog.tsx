import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { SearchEntry } from '../QuickActions/SearchModal';
import { useState } from 'react';

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
  return (
    <Dialog
      open={open}
      onClose={() => {
        saveChange(list);
        setOpen(false);
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box>
          {list.map((entry) => (
            <Box key={entry.name}>{entry.displayName()}</Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          Close
        </Button>
        <DialogActions />
      </DialogActions>
    </Dialog>
  );
};
