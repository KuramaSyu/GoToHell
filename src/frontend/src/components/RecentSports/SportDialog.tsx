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
  Input,
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
                  src={user.getAvatarUrl()}
                  alt={user.username}
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
                value={selectedSport.amount}
                disabled={user.id !== selectedSport.user_id}
              ></Input>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <GamepadIcon></GamepadIcon>
              {new GameEntry(selectedSport.game).displayName()}
            </Box>
          </DialogContent>
          <DialogActions>
            {selectedSport.user_id === user!.id && (
              <Button
                onClick={() => {
                  new UserApi().deleteRecord(selectedSport.id);
                }}
              >
                Delete Sport
              </Button>
            )}
            <Button onClick={() => setSelectedSport(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
