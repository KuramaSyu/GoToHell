import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

type CustomSelectProps = {
  items: Record<string, string>;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  items,
  label,
  value,
  onChange,
}) => {
  return (
    <FormControl variant="outlined" sx={{ flex: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        {Object.entries(items).map(([display, val]) => (
          <MenuItem key={val} value={val}>
            {display}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
