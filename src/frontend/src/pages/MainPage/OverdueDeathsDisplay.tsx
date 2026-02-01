import { alpha, Box, darken, Typography } from '@mui/material';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: '11vh',
        overflow: 'hidden',
        gap: 2,
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2, // padding to align the PopNumber vertically

          backgroundColor: darken(theme.palette.secondary.main, 0.4),
          height: '11vh',
          overflow: 'hidden',
          borderRadius: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            color: blendWithContrast(theme.palette.secondary.main, theme, 0.4),
          }}
        ></PopNumber>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontFamily: NUMBER_FONT,
            fontSize: '2vh',
          }}
        >
          Overdue
        </Typography>
        <Typography
          sx={{
            fontFamily: NUMBER_FONT,
            fontSize: '2vh',
          }}
        >
          deaths
        </Typography>
      </Box>
    </Box>
  );
};
