import {
  alpha,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import Sport from '../../models/Sport';
import { UserSport } from './Timeline';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUsersStore, useUserStore } from '../../userStore';
import { useTheme } from '@emotion/react';
import { useThemeStore } from '../../zustand/useThemeStore';
import { UserApi } from '../../utils/api/Api';

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
                backdropFilter: 'blur(5px)',
                backgroundColor: alpha(theme.palette.secondary.dark, 0.6),
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
              Details to {selectedSport!.kind} from{' '}
              {users[selectedSport!.user_id]?.username}
            </Box>
          </DialogTitle>
          <DialogContent dividers>test</DialogContent>
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
