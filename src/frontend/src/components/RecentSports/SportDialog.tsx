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
import Sport from '../../models/Sport';
import { UserSport } from './Timeline';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUsersStore, useUserStore } from '../../userStore';
import { useTheme } from '@emotion/react';
import { useThemeStore } from '../../zustand/useThemeStore';
import { UserApi } from '../../utils/api/Api';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { sportIconMap } from '../../utils/data/Sports';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NumbersIcon from '@mui/icons-material/Numbers';
import GamepadIcon from '@mui/icons-material/Gamepad';
import { GameEntry } from '../QuickActions/SearchModal';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { useEffect, useState } from 'react';
import {
  handleStringNumber,
  isNumeric,
  StringNumberProps,
} from '../../utils/UserNumber';
import SyncIcon from '@mui/icons-material/Sync';
import React from 'react';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Fade timeout={1000} ref={ref} {...props} />;
});

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

  const [amountValue, setAmountValue] = useState<number | null>(
    selectedSport?.amount ?? null
  );

  useEffect(() => {
    if (selectedSport) {
      setAmountValue(selectedSport.amount);
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
      console.error(error);
    }
  };

  const updateRecord = async (record: UserSport) => {};

  return (
    <>
      {selectedSport !== null && user !== null && (
        <Dialog
          open={selectedSport !== null}
          onClose={() => setSelectedSport(null)}
          fullScreen={isMobile}
          fullWidth
          maxWidth="sm"
          slotProps={{
            paper: {
              sx: {
                backdropFilter: 'blur(8px)',
                backgroundColor: alpha(theme.palette.primary.dark, 0.7),
                borderRadius: 8,
              },
            },
          }}
        >
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
                  // onClick={handleLogout} show details on click
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
                >
                  Apply Changes
                </Button>
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
        </Dialog>
      )}
    </>
  );
};
