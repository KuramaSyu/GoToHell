import {
  alpha,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Input,
  Slide,
  Tab,
  Tabs,
} from '@mui/material';
import { UserSport } from './Timeline';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useUsersStore, useUserStore } from '../../../userStore';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { UserApi } from '../../../utils/api/Api';
import { blendWithContrast } from '../../../utils/blendWithContrast';
import { sportIconMap } from '../../../utils/data/Sports';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NumbersIcon from '@mui/icons-material/Numbers';
import GamepadIcon from '@mui/icons-material/Gamepad';
import { GameEntry } from '../QuickActions/SearchEntry';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTotalScoreStore } from '../../../zustand/TotalScoreStore';
import { useEffect, useState } from 'react';

import SyncIcon from '@mui/icons-material/Sync';
import React from 'react';
import { TransitionProps } from '@mui/material/transitions';
import useInfoStore, { SnackbarUpdateImpl } from '../../../zustand/InfoStore';
import { SportDialog, SportDialogProps } from './SportDialog';

export const SportUserDialogWrapper: React.FC<SportDialogProps> = ({
  selectedSport,
  setSelectedSport,
}) => {
  const [tab, setTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Tabs value={tab} onChange={handleChange}>
      <Tab label="Sport" />
      <Tab label="User" />

      {tab === 0 && (
        <SportDialog
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
        />
      )}
    </Tabs>
  );
};
