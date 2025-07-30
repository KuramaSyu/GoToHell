import { Box, Dialog } from '@mui/material';
import { SearchEntry } from './QuickActions/SearchModal';

export interface SelectionDialogProps {
  list: SearchEntry[];
  saveChange: (list: SearchEntry[]) => void;
}
export const SelectionDialog: React.FC<SelectionDialogProps> = ({
  list,
  saveChange,
}) => {
  return (
    <Dialog open onClose={() => saveChange(list)}>
      <Box>
        {list.map((entry) => (
          <Box key={entry.name}>{entry.displayName()}</Box>
        ))}
      </Box>
    </Dialog>
  );
};
