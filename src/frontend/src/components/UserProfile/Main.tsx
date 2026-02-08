import { useEffect } from 'react';
import { useUserStore } from '../../userStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { useStreakStore } from '../../zustand/StreakStore';
import { useThemeStore } from '../../zustand/useThemeStore';
import { DiscordUserImpl } from '../DiscordLogin';
import Box from '@mui/material/Box/Box';
import Typography from '@mui/material/Typography/Typography';

export interface UserProfileProps {
  user: DiscordUserImpl | null; // to make it easier to reuse for other users
}
const UserProfileMain: React.FC<UserProfileProps> = ({ user }) => {
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

  return null;
};
