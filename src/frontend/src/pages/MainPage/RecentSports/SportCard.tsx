import { Box, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useUsersStore } from '../../../userStore';
import { NUMBER_FONT } from '../../../statics';
import { UserSport } from './Timeline';

interface SportCardProps {
  data: UserSport;
}

export const SportCard: React.FC<SportCardProps> = ({ data }) => {
  const { users } = useUsersStore();
  const sportUser = users[data.user_id];
  return (
    <Box
      sx={{
        display: 'flex', // Enables Flexbox
        flexShrink: 0, // Prevents shrinking
        alignSelf: 'flex-start', // Ensures it doesn't stretch in the parent flex container
        pl: 2,
        width: 'auto', // Ensures the width is determined by the content
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="body1"
        component="span"
        sx={{
          fontWeight: '300',
          textTransform: 'uppercase',
        }}
      >
        {data.kind.replace('_', ' ')}
      </Typography>

      <Typography variant="subtitle2" fontWeight={300}>
        {formatDistanceToNow(new Date(data.timedate), {
          addSuffix: true,
        })}
      </Typography>
    </Box>
  );
};

export const SportCardNumber: React.FC<SportCardProps> = ({ data }) => {
  const { users } = useUsersStore();
  const sportUser = users[data.user_id];
  return (
    <Box
      sx={{
        display: 'flex', // Enables Flexbox
        flexShrink: 0, // Prevents shrinking
        alignSelf: 'flex-start', // Ensures it doesn't stretch in the parent flex container
        borderRadius: '50%', // Makes the box a circle
        width: 65, // Set a fixed width
        height: 65, // Set the same height as the width
        background:
          'radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 85%, rgba(0,0,0,0) 100%)',
        justifyContent: 'center', // Centers content horizontally
        alignItems: 'center', // Centers content vertically
        overflow: 'hidden',
        mr: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: NUMBER_FONT,
          fontSize: '1.5rem', // Adjust font size as needed
          color: 'white', // Optional: text color for better visibility
        }}
        variant="h6"
      >
        {data.amount}
      </Typography>
    </Box>
  );
};
