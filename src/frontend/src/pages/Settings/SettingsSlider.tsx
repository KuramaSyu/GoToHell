import { Box, OutlinedInput, Slider } from '@mui/material';
import { GenerateMarks } from '../../utils/Marks';

export interface SettingsSliderProperties {
  min: number;
  max: number;
  sliderValue: number | null;
  setSliderValue: React.Dispatch<React.SetStateAction<number | null>>;
  saveValue: (game: string | null, value: number) => void;
  step?: number;
}
export const SettingsSlider: React.FC<SettingsSliderProperties> = ({
  min,
  max,
  sliderValue,
  setSliderValue,
  saveValue,
  step = 0.05,
}) => {
  const { marks } = GenerateMarks(4, min, max);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        backdropFilter: 'blur(25px)',
        padding: 5,
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}
    >
      <OutlinedInput
        value={sliderValue}
        type="number"
        onChange={(e) => {
          const value = parseFloat(e.target.value) || min;
          setSliderValue(value);
          saveValue(null, value);
        }}
        inputProps={{
          step: step,
          style: {
            textAlign: 'center',
          },
        }}
        sx={{
          fontSize: '24px',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      />
      <Slider
        size="medium"
        value={sliderValue ?? min}
        marks={marks}
        onChange={(e, value) => setSliderValue(value)}
        onChangeCommitted={(e, value) => saveValue(null, value)}
        min={min}
        max={max}
        step={step}
      />
    </Box>
  );
};
