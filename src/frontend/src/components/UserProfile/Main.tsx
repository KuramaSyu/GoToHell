import { useEffect } from 'react';
import { useUserStore } from '../../userStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { useStreakStore } from '../../zustand/StreakStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { DiscordUserImpl } from '../DiscordLogin';
import {
  Avatar,
  Divider,
  Stack,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';
import { PersonalGoalSynopsis } from '../TopBar/PersonalGoalSynopsis';
import { Streak } from '../TopBar/Streak';

export interface UserProfileProps {
  user: DiscordUserImpl | null; // to make it easier to reuse for other users
}
export const UserProfileMain: React.FC<UserProfileProps> = ({ user }) => {
  const { streak } = useStreakStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    async function fetchStreak() {
      if (!user) return;
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.Streak)
        .forceFetch();
    }
    fetchStreak();
  }, [user]);

  return (
    <Stack direction={'column'}>
      <Stack
        direction={'row'}
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
        />
        <Divider orientation='vertical' />
        <Typography variant='h6'> {user?.username ?? 'login'} </Typography>
      </Stack>
      <Divider orientation='horizontal' flexItem />
      <Stack
        direction={'row'}
        fontSize={theme.typography.h3.fontSize}
        justifyContent={'center'}
        spacing={theme.spacing(2)}
      >
        <Streak />
        <Divider orientation='vertical' flexItem />
        <PersonalGoalSynopsis typographyVariant={'h3'} />
      </Stack>
    </Stack>
  );
};
