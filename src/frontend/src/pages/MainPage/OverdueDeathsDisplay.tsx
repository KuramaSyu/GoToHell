import { alpha, Box, darken, Stack, Typography } from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';
import { PopNumber } from './PopNumber';
import { NUMBER_FONT } from '../../statics';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';
import { useEffect } from 'react';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { hexToRgbString } from '../../utils/colors/hexToRgb';

export const OverdueDeathsDisplay: React.FC = () => {
  const { theme } = useThemeStore();
  const { overdueDeathsList } = useOverdueDeathsStore();

  useEffect(() => {
    async function init() {
      new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.OverdueDeaths)
        .fetchIfNeeded();
    }
    init();
  }, []);

  return (
    <Stack direction={'row'} spacing={2} height={'100%'} alignItems={'center'}>
      <Box
        sx={{
          px: 2,
          py: 1,
          backgroundColor: theme.blendAgainstContrast('secondary', 0.4),
          borderRadius: '40px',
          display: 'flex',
          // alignItems: 'center',
          // justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            overflow: 'hidden',
            height: '115px', // crafted to match the multiplier and pop number font + size combo, since it has a weird margin at the bottom
            alignItems: 'center',
          }}
        >
          <PopNumber
            value={
              overdueDeathsList.find((x) => x.game === theme.custom.themeName)
                ?.count ?? 0
            }
            font={NUMBER_FONT}
            stiffness={1000}
            damping={300}
            mass={1}
            fontsize={theme.typography.h1.fontSize}
            style={{
              color: theme.blendWithContrast('secondary', 0.4),
            }}
          ></PopNumber>
        </Box>
      </Box>
      <Stack direction={'column'}>
        <Typography
          sx={{
            fontFamily: NUMBER_FONT,
            fontSize: theme.typography.h4.fontSize,
          }}
        >
          Overdue
        </Typography>
        <Typography
          sx={{
            fontFamily: NUMBER_FONT,
            fontSize: theme.typography.h4.fontSize,
          }}
        >
          Deaths
        </Typography>
      </Stack>
    </Stack>
  );
};
