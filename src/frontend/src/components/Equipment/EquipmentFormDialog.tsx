import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Step,
  StepLabel,
  Stepper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { EquipmentApi } from '../../utils/api/EquipmentApi';
import { EquipmentWithUsage } from '../../utils/api/responses/Equipment';
import {
  EQUIPMENT_SPORT_CONFIGS,
  getEquipmentConfig,
  kmToMeters,
  metersToKm,
} from '../../utils/data/Equipment';

interface EquipmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  equipment?: EquipmentWithUsage | null;
  defaultSport?: string | null;
}

const STEPS = ['Basics', 'Usage', 'Already used'];

/**
 * Add/edit dialog for a piece of equipment. Uses a stepper and converts the
 * user facing kilometer values to meters for the backend.
 */
export const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({
  open,
  onClose,
  onSaved,
  equipment = null,
  defaultSport = null,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preferredForSport, setPreferredForSport] = useState('');
  const [hasExpectedUsage, setHasExpectedUsage] = useState(true);
  const [expectedUsageKm, setExpectedUsageKm] = useState('');
  const [startUsageKm, setStartUsageKm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultConfig = getEquipmentConfig(
    equipment?.preferred_for_sport ?? defaultSport,
  );

  useEffect(() => {
    if (!open) return;
    const fallbackExpectedKm = metersToKm(
      defaultConfig?.defaultExpectedMeters ?? 800_000,
    );
    setName(equipment?.name ?? '');
    setDescription(equipment?.description ?? '');
    setPreferredForSport(equipment?.preferred_for_sport ?? defaultSport ?? '');
    setHasExpectedUsage(
      equipment ? equipment.expected_usage != null : true,
    );
    setExpectedUsageKm(
      equipment?.expected_usage != null
        ? String(metersToKm(equipment.expected_usage))
        : String(fallbackExpectedKm),
    );
    setStartUsageKm(
      equipment && equipment.start_usage_meters > 0
        ? String(metersToKm(equipment.start_usage_meters))
        : '',
    );
    setActiveStep(0);
    setError(null);
    setSaving(false);
  }, [open, equipment, defaultSport, defaultConfig]);

  const sliderConfig = useMemo(() => {
    const config = getEquipmentConfig(preferredForSport || defaultSport);
    return config ?? EQUIPMENT_SPORT_CONFIGS[0]!;
  }, [preferredForSport, defaultSport]);

  const expectedValue = Number(expectedUsageKm);
  const sliderValue = Number.isFinite(expectedValue)
    ? expectedValue
    : metersToKm(sliderConfig.defaultExpectedMeters);

  const nameValid = name.trim().length > 0;
  const expectedValid =
    !hasExpectedUsage ||
    (expectedUsageKm.trim() !== '' &&
      Number.isFinite(Number(expectedUsageKm)) &&
      Number(expectedUsageKm) > 0);
  const startValid =
    startUsageKm.trim() === '' ||
    (Number.isFinite(Number(startUsageKm)) && Number(startUsageKm) >= 0);

  const canContinue =
    activeStep === 0
      ? nameValid
      : activeStep === 1
        ? expectedValid
        : startValid;

  const handleNext = () => {
    if (canContinue) setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const handleSave = async () => {
    if (!nameValid || !expectedValid || !startValid) return;
    setSaving(true);
    setError(null);
    try {
      const api = new EquipmentApi();
      const startUsageMeters =
        startUsageKm.trim() === '' ? 0 : kmToMeters(Number(startUsageKm));
      const expectedMeters = hasExpectedUsage
        ? kmToMeters(Number(expectedUsageKm))
        : null;

      if (equipment) {
        const result = await api.update({
          id: equipment.id,
          name: name.trim(),
          description,
          start_usage_meters: startUsageMeters,
          preferred_for_sport: preferredForSport,
          ...(expectedMeters !== null
            ? { expected_usage: expectedMeters }
            : { clear_expected_usage: true }),
        });
        if (!result) throw new Error('Updating equipment failed');
      } else {
        const result = await api.create({
          name: name.trim(),
          description,
          start_usage_meters: startUsageMeters,
          expected_usage: expectedMeters,
          preferred_for_sport: preferredForSport || null,
        });
        if (!result) throw new Error('Creating equipment failed');
      }

      onSaved?.();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {equipment ? 'Edit Equipment' : 'Add Equipment'}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Stack direction='column' gap={2}>
            <TextField
              label='Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={!nameValid}
              helperText={!nameValid ? 'Give your equipment a name' : null}
              autoFocus
            />
            <TextField
              label='Description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel id='preferred-sport-label'>
                Preferred for sport
              </InputLabel>
              <Select
                labelId='preferred-sport-label'
                label='Preferred for sport'
                value={preferredForSport}
                onChange={(e) => setPreferredForSport(e.target.value)}
              >
                <MenuItem value=''>No preferred sport</MenuItem>
                {EQUIPMENT_SPORT_CONFIGS.map((config) => (
                  <MenuItem key={config.sport} value={config.sport}>
                    {config.label} ({config.sport})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack direction='column' gap={2}>
            <Typography variant='body1'>
              Set how much usage this equipment is expected to last. For a
              running shoe this is usually between 600 and 1000 km. You can
              enter any value in the input field.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={hasExpectedUsage}
                  onChange={(e) => setHasExpectedUsage(e.target.checked)}
                />
              }
              label='Set an expected usage'
            />
            {hasExpectedUsage && (
              <>
                <TextField
                  label='Expected usage (km)'
                  type='number'
                  value={expectedUsageKm}
                  onChange={(e) => setExpectedUsageKm(e.target.value)}
                  error={!expectedValid}
                  helperText={
                    !expectedValid
                      ? 'Expected usage must be greater than 0'
                      : null
                  }
                  inputProps={{ min: 0, step: 1 }}
                />
                <Box sx={{ px: 2 }}>
                  <Slider
                    min={sliderConfig.minKm}
                    max={sliderConfig.maxKm}
                    step={10}
                    marks={[
                      { value: sliderConfig.minKm, label: `${sliderConfig.minKm} km` },
                      { value: sliderConfig.maxKm, label: `${sliderConfig.maxKm} km` },
                    ]}
                    value={Math.min(
                      Math.max(sliderValue, sliderConfig.minKm),
                      sliderConfig.maxKm,
                    )}
                    onChange={(_, value) =>
                      setExpectedUsageKm(String(value as number))
                    }
                    valueLabelDisplay='auto'
                  />
                </Box>
              </>
            )}
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack direction='column' gap={2}>
            <Typography variant='body1'>
              If you already used this equipment before adding it to GoToHell,
              you can add the distance here. It is optional and will be added
              to the calculated usage.
            </Typography>
            <TextField
              label='Already used (km)'
              type='number'
              value={startUsageKm}
              onChange={(e) => setStartUsageKm(e.target.value)}
              error={!startValid}
              helperText={
                !startValid ? 'Must be a non-negative number' : 'Optional'
              }
              placeholder='e.g. 120'
              inputProps={{ min: 0, step: 1 }}
            />
            <Alert severity='info'>
              {name || 'Equipment'}:{' '}
              {hasExpectedUsage
                ? `${expectedUsageKm || 0} km expected usage`
                : 'no expected usage set'}
              {startUsageKm ? `, ${startUsageKm} km already used` : ''}
              {preferredForSport ? `, preferred for ${preferredForSport}` : ''}
            </Alert>
          </Stack>
        )}

        {error && <Alert severity='error' sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ color: 'text.primary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
          disabled={activeStep === 0 || saving}
          sx={{ color: 'text.primary' }}
        >
          Back
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} variant='contained' disabled={!canContinue}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            variant='contained'
            disabled={saving || !nameValid || !expectedValid || !startValid}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EquipmentFormDialog;
