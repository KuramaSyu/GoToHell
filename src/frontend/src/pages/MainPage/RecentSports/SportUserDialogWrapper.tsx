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
import { useUsersStore, useUserStore } from '../../../userStore';
import { useEffect, useState } from 'react';

import SyncIcon from '@mui/icons-material/Sync';
import React from 'react';
import { TransitionProps } from '@mui/material/transitions';
import useInfoStore, { SnackbarUpdateImpl } from '../../../zustand/InfoStore';
import { SportDialog, SportDialogProps } from './SportDialog';
import { UserInfo } from '../../../components/UserInfo';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useThemeStore } from '../../../zustand/useThemeStore';

export const SportUserDialogWrapper: React.FC<SportDialogProps> = ({
  selectedSport,
  setSelectedSport,
}) => {
  const [tab, setTab] = useState(0);
  const { users } = useUsersStore();
  const { isMobile } = useBreakpoint();
  const { theme } = useThemeStore();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Dialog
      open={selectedSport !== null}
      onClose={() => setSelectedSport(null)}
      fullScreen={isMobile}
      fullWidth
      maxWidth='sm'
      slotProps={{
        paper: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.primary.dark, 0.7),
            borderRadius: 1,
          },
        },
      }}
    >
      <Tabs value={tab} onChange={handleChange}>
        <Tab label='Sport' />
        <Tab label='User' />
      </Tabs>
      {tab === 0 ? (
        <SportDialog
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
        />
      ) : tab === 1 ? (
        <UserInfo user={users[selectedSport?.user_id!]!}></UserInfo>
      ) : null}
    </Dialog>
  );
};
