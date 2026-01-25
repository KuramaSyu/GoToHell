import { useEffect, useMemo, useState } from 'react';
import { usePersonalGoalsStore } from '../zustand/PersonalGoalsStore';
import {
  DefaultPersonalGoalCalculator,
  IPersonalGoalCalculator,
} from '../utils/PersonalGoalCalculator';
import {
  useRecentSportsStore,
  useYourRecentSportsStore,
} from '../zustand/RecentSportsState';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  CSSProperties,
  IconButton,
  Popover,
  Typography,
  TypographyVariant,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { useThemeStore } from '../zustand/useThemeStore';
import { NUMBER_FONT } from '../statics';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../utils/api/ApiRequirementsBuilder';
import { PersonalGoalBubble } from './PersonalGoalBubble';
import { BoxElevation1 } from '../theme/statics';

export interface PersonalGoalSynopsisProps {
  typographyVariant: TypographyVariant;
}
export const PersonalGoalSynopsis: React.FC<PersonalGoalSynopsisProps> = ({
  typographyVariant,
}) => {
  const { personalGoalsList, loaded } = usePersonalGoalsStore();
  const { recentSports } = useRecentSportsStore();
  const { theme } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    console.log('open popover');
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    console.log('close popover');
    setAnchorEl(null);
  };

  useEffect(() => {
    new ApiRequirementsBuilder()
      .add(ApiRequirement.UserPersonalGoals)
      .fetchIfNeeded();
  }, []);

  const totalPercentage = useMemo(() => {
    const calculator: IPersonalGoalCalculator =
      new DefaultPersonalGoalCalculator();
    return calculator.calculatePercentageDoneAllGoals(
      personalGoalsList,
      recentSports?.data ?? [],
    );
  }, [personalGoalsList, recentSports]);

  return (
    <div>
      <Box
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{
          padding: '6px 8px', // Default MUI button padding, adjust as needed
          borderRadius: theme.shape.borderRadius,
          color: theme.palette.primary.light,
          '&:hover': {
            backgroundColor: alpha(
              theme.blendAgainstContrast('secondary', 0.2),
              0.8,
            ),
          },
        }}
      >
        <Typography
          color='textPrimary'
          fontWeight={200}
          variant={typographyVariant}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <FlagIcon
            sx={{
              mr: 1,
              fontSize: 'inherit',
              color: theme.palette.primary.light,
            }}
          />
          {Math.round(totalPercentage * 100)}%
        </Typography>
      </Box>
      <Popover
        sx={{
          mt: 1,
          pointerEvents: 'none', // to prevent flickering
        }}
        open={anchorEl !== null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              boxShadow: 'none',
              borderRadius: theme.shape.borderRadius,
            },
          },
        }}
      >
        <PersonalGoalBubble />
      </Popover>
    </div>
  );
};
