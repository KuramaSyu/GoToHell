import { Box, darken, lighten, Typography, Tooltip, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { useUsersStore } from '../../../userStore';
import { NUMBER_FONT } from '../../../statics';
import { UserSport, UserSportGroup } from './models/SportModels';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { hexToRgbString } from '../../../utils/colors/hexToRgb';
import {
  DefaultDescriptionProvider,
  getSportDescription,
  getSportName,
  getSportNameAndDescription,
} from '../../../utils/DescriptionProvider';
import { defaultAmountFormatter } from '../../../utils/AmountFormatter';

interface SportCardProps {
  data: UserSport;
}

// Use shared AmountFormatter for formatting amounts (counts, distances)

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
        color: theme.palette.text.secondary,
      }}
    >
      <Typography
        variant='body1'
        component='span'
        sx={{
          fontWeight: '350',
          textTransform: 'uppercase',
        }}
      >
        {getSportName(data.kind)}
      </Typography>

      <Typography variant='subtitle2' fontWeight={350} color='inherit'>
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
          color: theme.palette.text.secondary,
        }}
        variant='h6'
      >
        {defaultAmountFormatter.formatCompact(data.amount, undefined)}
      </Typography>
    </Box>
  );
};

interface SportGroupCardProps {
  data: UserSportGroup;
}

export const SportGroupCardNumber: React.FC<SportGroupCardProps> = ({
  data,
}) => {
  const total = data.entries.reduce((s, e) => s + e.amount, 0);
  return (
    <SportCardNumber
      data={{
        ...data.entries[0]!,
        amount: total,
      }}
    />
  );
};

export const SportGroupTimelineEntry: React.FC<SportGroupCardProps> = ({
  data,
}) => {
  const { users } = useUsersStore();
  const { theme } = useThemeStore();
  const firstTimedate = data.entries[0]?.timedate ?? new Date().toISOString();
  const lastTimedate =
    data.entries[data.entries.length - 1]?.timedate ?? firstTimedate;
  const start = firstTimedate;
  const end = lastTimedate;
  const nameProvider = new DefaultDescriptionProvider();
  const entriesCount = data.entries.length;

  /**
   * Checks if the given datetime string corresponds to yesterday's date.
   * @param d datetime
   * @returns true if day is yesterday
   */
  const isYesterday = (d: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    );
  };

  const formatShort = (iso: string) => {
    const d = new Date(iso);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return `yesterday ${format(d, 'HH:mm')}`;
    return format(d, 'EEEEEE, do MMM HH:mm');
  };

  const formatDurationShort = (fromIso: string, toIso: string) => {
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    const diff = Math.max(0, to - from);
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexShrink: 0,
        alignSelf: 'flex-start',
        pl: 2,
        width: 'auto',
        flexDirection: 'column',
        color: theme.palette.text.secondary,
      }}
    >
      <Typography
        variant='body1'
        component='span'
        sx={{
          fontWeight: '350',
          textTransform: 'uppercase',
        }}
      >
        {Array.from(
          new Set(
            data.entries.map(
              (e) => nameProvider.get_name(e.kind) ?? e.kind.replace('_', ' '),
            ),
          ),
        ).join(', ')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant='subtitle2' fontWeight={350} color='inherit'>
          {formatDistanceToNow(new Date(lastTimedate), {
            addSuffix: true,
          })}
        </Typography>
        <Typography variant='subtitle2' fontWeight={350} color='inherit'>
          {isToday(new Date(lastTimedate))
            ? format(new Date(lastTimedate), 'HH:mm')
            : formatDistanceToNow(new Date(lastTimedate), { addSuffix: true })}
        </Typography>
        {entriesCount > 1 && (
          <>
            <Box>
              <Tooltip title={`${formatShort(start)} — ${formatShort(end)}`}>
                <Chip
                  icon={<TimelapseIcon fontSize='small' />}
                  label={formatDurationShort(start, end)}
                  size='small'
                />
              </Tooltip>
            </Box>
            <Box>
              <Chip
                icon={<FilterNoneIcon fontSize='small' />}
                label={`${entriesCount} entries`}
                size='small'
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
