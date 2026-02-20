import { useEffect, useState } from 'react';
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
  alpha,
  StackProps,
} from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';
import { PersonalGoalSynopsis } from '../TopBar/PersonalGoalSynopsis';
import { Streak } from '../TopBar/Streak';
import { UserApi } from '../../utils/api/Api';
import { GetUserDetailsResponse } from '../../utils/api/responses/UserDetails';
import { TitleValuePill } from '../TitleValuePill';

export interface UserProfileProps {
  user: DiscordUserImpl | null; // to make it easier to reuse for other users
}
export const UserProfileMain: React.FC<UserProfileProps> = ({ user }) => {
  const [userDetails, setUserDetails] = useState<GetUserDetailsResponse | null>(
    null,
  );
  const { theme } = useThemeStore();

  useEffect(() => {
    async function fetchStreak() {
      if (!user) return;
      const details = await new UserApi().fetchUserDetails(user.id, true);
      setUserDetails(details);
    }
    fetchStreak();
  }, [user]);

  if (!userDetails) {
    return null;
  }

  return (
    <Stack
      direction={'column'}
      gap={theme.spacing(2)}
      px={theme.spacing(2)}
      py={theme.spacing(2)}
    >
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
      <StyledRowStack>
        <Typography fontSize='inherit'>Streak:</Typography>
        <Typography fontSize='inherit'>
          {userDetails!.current_streak.days} Days
        </Typography>
      </StyledRowStack>
      <StyledRowStack>
        <Typography fontSize='inherit'>Longest Streak:</Typography>
        <Typography fontSize='inherit'>
          {userDetails!.longest_streak.days} Days
        </Typography>
      </StyledRowStack>
    </Stack>
  );
};

function StyledRowStack({ children, sx, ...props }: StackProps) {
  const { theme } = useThemeStore();
  const StackBackgroundSx = {
    backgroundColor: alpha(theme.palette.background.paper, 0.33),
    borderRadius: theme.shape.borderRadius,
    px: theme.spacing(4),
    py: theme.spacing(2),
  };

  return (
    <Stack
      direction={'row'}
      fontSize={theme.typography.h6.fontSize}
      justifyContent={'space-between'}
      sx={{ ...StackBackgroundSx, ...sx }}
      {...props}
    >
      {children}
    </Stack>
  );
}
