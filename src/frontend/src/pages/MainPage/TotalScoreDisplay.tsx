import { useEffect } from 'react';

import { useUserStore } from '../../userStore';
import { SportScore } from '../../models/Sport';

import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { useSportStore } from '../../useSportStore';
import { Box, Tooltip, Typography } from '@mui/material';
import { NUMBER_FONT } from '../../statics';
import { useThemeStore } from '../../zustand/useThemeStore';
import {
  AMOUNT_DISPLAY_CONENT_SX,
  AMOUNT_DISPLAY_CONTENT_BOX_SX,
  AMOUNT_DISPLAY_TITLE_SX,
  getDisplayComponent,
} from './AmountDisplay';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { getSportDescription } from '../../utils/DescriptionProvider';

// returns the score of the kind
// game does not matter, since it's summed up
const GetScore = (kind: string, amounts: SportScore[]) => {
  const score = amounts.find((score) => score.kind === kind);
  return score?.amount || 0;
};

export const TotalScoreDisplay = () => {
  const { currentSport } = useSportStore();
  const { user } = useUserStore();
  const { amounts, setAmounts, refreshTrigger } = useTotalScoreStore();
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        return;
      }
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.TotalScore)
        .fetchIfNeeded();
    };
    fetchData();
  }, [user, refreshTrigger]);

  if (!currentSport || !user) {
    return <Typography></Typography>;
  }
  const DisplayComponent = getDisplayComponent(currentSport.sport!);

  const bigNumber = GetScore(currentSport!.sport!, amounts);
  return (
    <Tooltip
      title={
        <>
          <Typography>You have already done</Typography>
          <Typography>
            {bigNumber} {getSportDescription(currentSport.sport!, bigNumber)}
          </Typography>
        </>
      }
      arrow
      placement='right'
    >
      <Box>
        <DisplayComponent computedValue={bigNumber} isMobile={isMobile} />
      </Box>
    </Tooltip>
  );
};
