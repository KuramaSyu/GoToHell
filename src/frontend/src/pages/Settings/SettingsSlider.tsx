import { Box, OutlinedInput, Slider } from '@mui/material';
import { GenerateMarks } from '../../utils/Marks';

export interface SettingsSliderProperties {
  min: number;
  max: number;
  sliderValue: number | null;
  setSliderValue: React.Dispatch<React.SetStateAction<number | null>>;
  saveValue: (game: string | null, value: number) => void;
}
export const SettingsSlider: React.FC<SettingsSliderProperties> = ({
  min,
  max,
  sliderValue,
  setSliderValue,
  saveValue,
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
          step: 0.05,
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
        onChange={(e, value) =>
          setSliderValue(Array.isArray(value) ? value[0] ?? min : value)
        }
        onChangeCommitted={(e, value) =>
          saveValue(null, Array.isArray(value) ? value[0] ?? min : value ?? min)
        }
        min={min}
        max={max}
        step={0.05}
      />
    </Box>
  );
};
