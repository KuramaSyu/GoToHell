import { Box, Typography } from '@mui/material';

import TimelineDot from '@mui/lab/TimelineDot';

import { NUMBER_FONT } from '../../../statics';
import { useThemeStore } from '../../../zustand/useThemeStore';

import { DiscordUserImpl } from '../../../components/DiscordLogin';
import { animated, SpringValue } from 'react-spring';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

interface StreakCardProps {
  user: DiscordUserImpl;
  style?: {
    opacity?: SpringValue<number>;
    y?: SpringValue<number>;
    scale?: SpringValue<number>;
  };
}

const AnimatedBox = animated(Box);

export const StreakCard: React.FC<StreakCardProps> = ({ user, style }) => {
  return (
    <AnimatedBox
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      style={style}
    >
      <Box width={1 / 3}>
        <StreakCardNumber user={user} style={style}></StreakCardNumber>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <TimelineDot
          color="primary"
          key={user.id}
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            margin: 'auto',
          }}
        >
          <img
            src={user.getAvatarUrl()}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              top: 0,
              left: 0,
              objectFit: 'cover',
            }}
          />
        </TimelineDot>
        <Box sx={{ alignContent: 'center', fontSize: 18 }}>{user.username}</Box>
      </Box>
    </AnimatedBox>
  );
};
export const StreakCardNumber: React.FC<StreakCardProps> = ({ user }) => {
  const { theme } = useThemeStore();
  return (
    <Box
      sx={{
        filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.5))', // Apply drop shadow here

        fontFamily: NUMBER_FONT,
        color: theme.palette.primary.main,
        height: '100%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <LocalFireDepartmentIcon sx={{ fontSize: '3.2rem', mr: 1 }} />
      <Typography
        fontFamily={NUMBER_FONT}
        fontSize={'1.5rem'}
        sx={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))' }}
      >
        {user.streak ?? 0}
      </Typography>
    </Box>
  );
};
