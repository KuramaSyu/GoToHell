import { Box, OutlinedInput, Slider } from '@mui/material';
import { useEffect, useState } from 'react';
import { SettingsSlider } from './Sliders';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { UserPreferences } from '../../models/Preferences';
import { setCookie } from '../../utils/cookies';

export const PlankOverride: React.FC = () => {
  const { preferences, setPreferences } = usePreferenceStore();
  const [maxSeconds, setMaxSeconds] = useState<number | null>(null);

  // set plank when prefs change
  useEffect(() => {
    const plank = preferences.sport_specific.plank;
    if (plank) {
      setMaxSeconds(plank.seconds);
    }
  }, []);
  const min = 60;
  const max = 300;

  const savePlankSeconds = (game: string | null, value: number) => {
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

  return (
    <SettingsSlider
      min={0}
      max={360}
      setSliderValue={setMaxSeconds}
      sliderValue={maxSeconds}
      saveValue={savePlankSeconds}
      step={1}
    ></SettingsSlider>
  );
};
