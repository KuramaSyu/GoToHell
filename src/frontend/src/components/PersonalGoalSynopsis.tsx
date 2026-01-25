import { useEffect, useMemo } from 'react';
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

export interface PersonalGoalSynopsisProps {
  typographyVariant: TypographyVariant;
}
export const PersonalGoalSynopsis: React.FC<PersonalGoalSynopsisProps> = ({
  typographyVariant,
}) => {
  const { personalGoalsList, loaded } = usePersonalGoalsStore();
  const { recentSports } = useRecentSportsStore();
  const { theme } = useThemeStore();

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
    <ButtonBase
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
    </ButtonBase>
  );
};
