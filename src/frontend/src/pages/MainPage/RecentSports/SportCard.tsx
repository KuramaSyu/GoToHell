import { Box, darken, lighten, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useUsersStore } from '../../../userStore';
import { NUMBER_FONT } from '../../../statics';
import { UserSport } from './Timeline';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { hexToRgbString } from '../../../utils/colors/hexToRgb';

interface SportCardProps {
  data: UserSport;
}

class AmountCalculator {
  static calculateAmount(data: UserSport): string {
    if (data.amount >= 1000) {
      const value = data.amount / 1000;
      // If the number is a whole number, don't show decimal part.
      if (value % 1 === 0) {
        return `${value}K`;
      }
      // Otherwise, round it to one decimal place.
      return `${value.toFixed(1)}K`;
    }
    // Assuming data.amount is the amount of the sport
    return data.amount.toString();
  }
}

export const SportTimelineEntry: React.FC<SportCardProps> = ({ data }) => {
  const { users } = useUsersStore();
  const { theme } = useThemeStore();
  const sportUser = users[data.user_id];
  return (
    <Box
      sx={{
        display: 'flex',
        flexShrink: 0,
        alignSelf: 'flex-start', // Ensures it doesn't stretch in the parent flex container
        pl: 2,
        width: 'auto', // Ensures the width is determined by the content
        flexDirection: 'column',
        color: theme.palette.secondary.contrastText,
      }}
    >
      <Typography
        variant="body1"
        component="span"
        color={theme.palette.secondary.contrastText}
        sx={{
          fontWeight: '350',
          textTransform: 'uppercase',
        }}
      >
        {data.kind.replace('_', ' ')}
      </Typography>

      <Typography variant="subtitle2" fontWeight={350}>
        {formatDistanceToNow(new Date(data.timedate), {
          addSuffix: true,
        })}
      </Typography>
    </Box>
  );
};

export const SportCardNumber: React.FC<SportCardProps> = ({ data }) => {
  const { users } = useUsersStore();
  const { theme } = useThemeStore();
  const sportUser = users[data.user_id];
  const color = '0,0,0';
  return (
    <Box
      sx={{
        display: 'flex', // Enables Flexbox
        flexShrink: 0, // Prevents shrinking
        alignSelf: 'flex-start', // Ensures it doesn't stretch in the parent flex container
        borderRadius: '50%', // Makes the box a circle
        width: 65, // Set a fixed width
        height: 65, // Set the same height as the width
        background: `radial-gradient(circle, rgba(${color},0.5) 0%, rgba(${color},0.05) 85%, rgba(${color},0) 100%)`,
        justifyContent: 'center', // Centers content horizontally
        alignItems: 'center', // Centers content vertically
        overflow: 'hidden',
        mr: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: NUMBER_FONT,
          fontSize: '1.5rem',
          color: theme.palette.secondary.contrastText,
        }}
        variant="h6"
      >
        {AmountCalculator.calculateAmount(data)}
      </Typography>
    </Box>
  );
};
