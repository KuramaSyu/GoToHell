import { useEffect } from 'react';

import { useUserStore } from '../../userStore';
import { SportScore } from '../../models/Sport';

import { useTotalScoreStore } from '../../zustand/TotalScoreStore';
import { useSportStore } from '../../useSportStore';
import { Box, Typography } from '@mui/material';
import { NUMBER_FONT } from '../../statics';
import { useThemeStore } from '../../zustand/useThemeStore';
import {
  AMOUNT_DISPLAY_CONENT_SX,
  AMOUNT_DISPLAY_CONTENT_BOX_SX,
  AMOUNT_DISPLAY_TITLE_SX,
  getDisplayComponent,
  getSportDescription,
} from './AmountDisplay';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'column',
          lg: 'row',
        },
        justifyItems: 'center',
        alignItems: {
          xs: 'left',
          md: 'left',
          lg: 'center',
        },
        fontFamily: NUMBER_FONT,
      }}
    >
      <Box
        sx={{
          mr: 2,
          //width: `calc(12vh * 0.6 * ${bigNumber.toString().length})`,
        }}
      >
        <DisplayComponent computedValue={bigNumber} isMobile={isMobile} />
      </Box>
      <Box sx={AMOUNT_DISPLAY_CONTENT_BOX_SX}>
        <Typography sx={AMOUNT_DISPLAY_TITLE_SX} fontFamily={'inherit'}>
          {getSportDescription(currentSport.sport!, bigNumber)}
        </Typography>
        <Typography sx={AMOUNT_DISPLAY_CONENT_SX} fontFamily={'inherit'}>
          in total
        </Typography>
      </Box>
    </Box>
  );
};
