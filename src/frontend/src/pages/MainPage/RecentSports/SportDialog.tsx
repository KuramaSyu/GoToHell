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

export interface SportDialogProps {
  selectedSport: UserSport | null;
  setSelectedSport: React.Dispatch<React.SetStateAction<UserSport | null>>;
}
export const SportDialog: React.FC<SportDialogProps> = ({
  selectedSport,
  setSelectedSport,
}) => {
  const { isMobile } = useBreakpoint();
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const { theme } = useThemeStore();
  const { setMessage } = useInfoStore();
  const [prevSportId, setPrevSportId] = useState<number | null>(
    selectedSport?.id ?? null
  );
  const [amountValue, setAmountValue] = useState<number | null>(
    selectedSport?.amount ?? null
  );
  // Check if the sport is too old to be edited (>2d)
  const isTooOld = (time: string): boolean => {
    const date = new Date(time);
    const now = new Date();
    return now.getTime() - date.getTime() > 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
  };

  // update amountValue when selectedSport (ID) changes
  useEffect(() => {
    if (selectedSport && selectedSport.id !== prevSportId) {
      setAmountValue(selectedSport.amount);
      setPrevSportId(selectedSport.id);
    }
  }, [selectedSport]);

  const deleteRecord = async (id: number) => {
    try {
      const response = await new UserApi().deleteRecord(id);
      if (response === null) {
        throw new Error('Failed to delete record');
      }
      // Trigger total score refresh.
      useTotalScoreStore.getState().triggerRefresh();
    } catch (error) {
      setMessage(
        new SnackbarUpdateImpl('Failed to delete sport record', 'error')
      );
      console.error(error);
    }
  };

  const updateRecord = async (record: UserSport) => {
    try {
      const _ = await new UserApi().patchSport(
        record.id,
        null, // kind is not being changed
        null, // game is not being changed
        amountValue,
        true
      );
      selectedSport!.amount = amountValue!;
    } catch (error) {
      console.error('Failed to update record:', error);
    }
  };

  return (
    <>
      {selectedSport !== null && user !== null && (
        <>
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  width: 1 / 2,
                  fontWeight: 300,
                }}
              >
                <Avatar
                  src={users[selectedSport!.user_id]?.getAvatarUrl()}
                  alt={users[selectedSport!.user_id]?.username}
                  sx={{
                    width: 60,
                    height: 60,
                    filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))',
                  }}
                />

                {users[selectedSport!.user_id]?.username}
              </Box>
              <Divider orientation="vertical" flexItem></Divider>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 300,
                  width: 1 / 2,
                }}
              >
                <img
                  src={sportIconMap[String(selectedSport.kind)]}
                  alt={String(selectedSport.kind)}
                  style={{
                    width: 60,
                    height: 60,
                    filter: 'brightness(0) invert(1)',
                    marginRight: 1,
                  }}
                />
                {selectedSport.kind.toUpperCase()}
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <CalendarMonthIcon></CalendarMonthIcon>
              {new Date(selectedSport.timedate).toLocaleString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <NumbersIcon></NumbersIcon>
              <Input
                value={amountValue}
                // type="number"
                onChange={(e) => {
                  setAmountValue(Number(e.target.value));
                }}
                disabled={user.id !== selectedSport.user_id}
                sx={{
                  // Change color of the underline on focus when not in error state
                  '&:not(.Mui-error):after': {
                    borderBottomColor: theme.palette.success.main,
                  },
                }}
              ></Input>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <GamepadIcon></GamepadIcon>
              {new GameEntry(selectedSport.game).displayName()}
            </Box>
          </DialogContent>
          <DialogActions>
            {selectedSport.user_id === user!.id && (
              <>
                {!isTooOld(selectedSport.timedate) && (
                  <Button
                    sx={{
                      color: blendWithContrast(
                        theme.palette.primary.main,
                        theme,
                        2 / 3
                      ),
                    }}
                    startIcon={<SyncIcon></SyncIcon>}
                    onClick={() => {
                      updateRecord(selectedSport);
                    }}
                    disabled={amountValue === selectedSport.amount}
                  >
                    Apply Changes
                  </Button>
                )}
                <Button
                  color="error"
                  startIcon={<DeleteForeverIcon></DeleteForeverIcon>}
                  onClick={() => {
                    deleteRecord(selectedSport.id).then(() =>
                      setSelectedSport(null)
                    );
                  }}
                >
                  Delete Sport
                </Button>
              </>
            )}
            <Button
              sx={{
                color: blendWithContrast(
                  theme.palette.primary.main,
                  theme,
                  2 / 3
                ),
              }}
              onClick={() => setSelectedSport(null)}
            >
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </>
  );
};
