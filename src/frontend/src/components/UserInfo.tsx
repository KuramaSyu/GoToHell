import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, DialogContent, DialogTitle, Divider } from '@mui/material';

import { useStreakStore } from '../zustand/StreakStore';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../utils/api/ApiRequirementsBuilder';
import { useUsersStore, useUserStore } from '../userStore';
import { DiscordUser, DiscordUserImpl } from './DiscordLogin';
import Tooltip from '@mui/material/Tooltip';
import { RowingRounded } from '@mui/icons-material';
import { log } from 'console';
export interface UserInfoProps {
  user: DiscordUser;
}

export const UserInfo = ({ user: discordUser }: UserInfoProps) => {
  const { user: loggedInUser } = useUserStore();
  const [user, setUser] = React.useState<DiscordUserImpl>(
    new DiscordUserImpl(discordUser)
  );

  // fetch user streaks on mount
  useEffect(() => {
    async function fetchStreaks() {
      if (user.id === loggedInUser?.id) {
        await new ApiRequirementsBuilder()
          .add(ApiRequirement.Streak)
          .forceFetch();
      } else {
        await new ApiRequirementsBuilder()
          .add(ApiRequirement.AllStreaks)
          .fetchIfNeeded(); // only fetch once out of performance reasons
      }
    }
    fetchStreaks();
    setUser((prevUser) => useUsersStore.getState().users[prevUser.id]!);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'left',
            alignItems: 'center',
            gap: 4,
            p: 1,
            fontWeight: 300,
          }}
        >
          <Avatar
            sx={{ width: 64, height: 64 }}
            src={user ? user.getAvatarUrl() : undefined}
            alt={user ? user.username : ''}
          ></Avatar>
          {user?.username ?? 'login'}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Tooltip title="Amount of days where sport was back to back done" arrow>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <LocalFireDepartmentIcon />
            <Typography>Streak</Typography>
            <Box
              sx={{
                display: 'flex',
                width: '50%',
                justifyContent: 'center',
                alignItems: 'center',
                justifyItems: 'center',
                alignContent: 'center',
              }}
            >
              <Typography>{user.streak ?? 0} days</Typography>
            </Box>
          </Box>
        </Tooltip>
      </DialogContent>
    </Box>
  );
};
