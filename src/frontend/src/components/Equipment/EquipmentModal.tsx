import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EquipmentApi } from '../../utils/api/EquipmentApi';
import { EquipmentWithUsage } from '../../utils/api/responses/Equipment';
import { useEquipmentStore } from '../../zustand/EquipmentStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import {
  formatMeters,
  getEquipmentConfig,
  getUsagePercentage,
} from '../../utils/data/Equipment';
import { EquipmentFormDialog } from './EquipmentFormDialog';
import { ConfirmationModal } from '../../pages/SettingsV2/ConfirmationModal';

interface EquipmentModalProps {
  open: boolean;
  onClose: () => void;
  defaultSport?: string | null;
}

/**
 * Overview dialog to manage all equipment. Each item can be edited or deleted
 * and new equipment can be added through a stepper.
 */
export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  open,
  onClose,
  defaultSport = null,
}) => {
  const { equipment, loaded } = useEquipmentStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentWithUsage | null>(null);
  const [deleting, setDeleting] = useState<EquipmentWithUsage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserEquipment)
      .fetchIfNeeded();
  }, [open]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: EquipmentWithUsage) => {
    setEditing(item);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      const success = await new EquipmentApi().remove(deleting.id);
      if (!success) throw new Error('Deleting equipment failed');
      setDeleting(null);
    } catch (e) {
      setDeleteError(String(e));
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
        <DialogTitle>
          <Typography variant='h6'>Equipment</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage your equipment and the expected usage
          </Typography>
        </DialogTitle>
        <DialogContent>
          {equipment.length === 0 ? (
            <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant='body1'>
                {loaded
                  ? 'No equipment yet. Add your first piece of equipment.'
                  : 'Loading equipment...'}
              </Typography>
            </Paper>
          ) : (
            <Stack direction='column' gap={2}>
              {equipment.map((item) => {
                const percentage = getUsagePercentage(item);
                const config = getEquipmentConfig(item.preferred_for_sport);
                return (
                  <Paper key={item.id} variant='outlined' sx={{ p: 2 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      gap={2}
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      justifyContent='space-between'
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction='row' gap={1} alignItems='center' flexWrap='wrap'>
                          <Typography variant='h6'>{item.name}</Typography>
                          {config && (
                            <Chip
                              size='small'
                              color='primary'
                              label={`Preferred ${config.singular} for ${config.sport}`}
                            />
                          )}
                        </Stack>
                        {item.description && (
                          <Typography variant='body2' color='text.secondary'>
                            {item.description}
                          </Typography>
                        )}
                        <Typography variant='body2' sx={{ mt: 1 }}>
                          {formatMeters(item.current_usage_meters)}
                          {item.expected_usage
                            ? ` / ${formatMeters(item.expected_usage)}`
                            : ' used (no expected usage)'}
                          {percentage !== null
                            ? ` (${Math.round(percentage)}%)`
                            : ''}
                        </Typography>
                        {percentage !== null && (
                          <LinearProgress
                            variant='determinate'
                            color={percentage >= 100 ? 'error' : 'primary'}
                            value={Math.min(percentage, 100)}
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        )}
                      </Box>
                      <Stack direction='row' gap={1}>
                        <IconButton aria-label={`edit ${item.name}`} onClick={() => openEdit(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label={`delete ${item.name}`}
                          color='error'
                          onClick={() => setDeleting(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
          {deleteError && (
            <Typography color='error' sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={onClose} sx={{ color: 'text.primary' }}>
            Close
          </Button>
          <Button variant='contained' startIcon={<AddIcon />} onClick={openAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <EquipmentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        equipment={editing}
        defaultSport={defaultSport}
      />

      <ConfirmationModal
        open={deleting !== null}
        title='Delete equipment?'
        message={`Do you really want to delete ${deleting?.name ?? ''}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
};

export default EquipmentModal;
