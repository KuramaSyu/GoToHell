import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Divider } from '@mui/material';

import { useStreakStore } from '../zustand/StreakStore';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../utils/api/ApiRequirementsBuilder';
import { useUserStore } from '../userStore';
import { DiscordUser, DiscordUserImpl } from './DiscordLogin';

export interface UserInfoProps {
  user: DiscordUser;
}

export const UserInfo = ({ user: discordUser }: UserInfoProps) => {
  const user = new DiscordUserImpl(discordUser);
  const { streak } = useStreakStore();
  useEffect(() => {
    async function fetchStreak() {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.Streak)
        .forceFetch();
    }
    fetchStreak();
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              p: 1,
            }}
          >
            <Avatar
              sx={{ width: 64, height: 64 }}
              src={user ? user.getAvatarUrl() : undefined}
              alt={user ? user.username : ''}
            ></Avatar>
            <Divider orientation="vertical"></Divider>
            <Typography variant="h6"> {user?.username ?? 'login'} </Typography>
          </Box>
          <Divider></Divider>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '70%' }}>
            <Typography variant="h6">Streak</Typography>
            <Typography variant="subtitle2">
              Amount of days where sport was back to back done
            </Typography>
          </Box>
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
            <Typography variant="h3">
              <LocalFireDepartmentIcon fontSize="inherit" />
              {streak}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
