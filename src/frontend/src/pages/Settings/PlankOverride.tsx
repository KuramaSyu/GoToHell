import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  DesktopTimePicker,
  LocalizationProvider,
  MobileTimePicker,
} from '@mui/x-date-pickers';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { UserPreferences } from '../../models/Preferences';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const PlankOverride: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const { isMobile } = useBreakpoint();
  const [maxSeconds, setMaxSeconds] = useState<number | null>(null);

  // set plank when prefs change
  useEffect(() => {
    const plank = preferences.sport_specific.plank;
    if (plank) {
      setMaxSeconds(plank.seconds);
    }
  }, []);

  const secondsToDate = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return new Date(2000, 0, 1, hours, minutes, remainder);
  };

  const dateToSeconds = (value: Date) =>
    value.getHours() * 3600 + value.getMinutes() * 60 + value.getSeconds();

  const savePlankSeconds = (value: number) => {
    setMaxSeconds(Number(value));
    const newPreferences: UserPreferences = {
      ...preferences,
      sport_specific: {
        ...preferences.sport_specific,
        plank: {
          seconds: value,
        },
      },
    };
    setPreferences(newPreferences);
  };

  const pickerValue = secondsToDate(maxSeconds ?? 0);

  const handleTimeChange = (value: Date | null) => {
    if (!value) {
      return;
    }

    const seconds = dateToSeconds(value);
    savePlankSeconds(seconds);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ px: 1 }}>
        {isMobile ? (
          <MobileTimePicker
            label='Plank time'
            value={pickerValue}
            onChange={handleTimeChange}
            ampm={false}
            views={['minutes', 'seconds']}
            minutesStep={1}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        ) : (
          <DesktopTimePicker
            label='Plank time'
            value={pickerValue}
            onChange={handleTimeChange}
            ampm={false}
            openTo='minutes'
            views={['minutes', 'seconds']}
            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};
