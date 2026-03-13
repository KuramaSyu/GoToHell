import { Stack, Switch, Typography } from '@mui/material';
import useFeatureStore from '../../zustand/FeatureStore';

export const ResetAppearenceSettingsLogic = () => {
  useFeatureStore.getState().resetFlags();
};

export function AppearenceSettings() {
  const flags = useFeatureStore((state) => state.flags);
  const setFlag = useFeatureStore((state) => state.setFlag);
  const featureFlagKeys = Object.keys(flags) as Array<keyof typeof flags>;

  return (
    <Stack direction='column' gap={2}>
      <Typography variant='body1'>
        Enable or disable optional UI elements and experiments.
      </Typography>

      {featureFlagKeys.map((flagName) => {
        const flag = flags[flagName];
        return (
          <Stack
            key={flagName}
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            gap={2}
            sx={{
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction='column' gap={1}>
              <Typography variant='subtitle1'>{flag.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {flag.description}
              </Typography>
            </Stack>

            <Switch
              checked={flag.enabled}
              onChange={(_, checked) => setFlag(flagName, checked)}
              inputProps={{ 'aria-label': flag.name + ' toggle' }}
            />
          </Stack>
        );
      })}
    </Stack>
  );
}
