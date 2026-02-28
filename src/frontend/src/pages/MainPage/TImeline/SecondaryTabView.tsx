import { Box, Fade } from '@mui/material';
import { OverdueDeathsDisplay } from '../OverdueDeathsDisplay';
import { useOverdueDeathsStore } from '../../../zustand/OverdueDeathsStore';
import { useThemeStore } from '../../../zustand/useThemeStore';

export const SecondaryTabView: React.FC = () => {
  // this is already calculated anyways in the top component, so just fade in

  // const overdueDeaths = overdueDeathsList.find(
  //   (x) => x.game === theme.custom.themeName,
  // )?.count;

  return (
    <Fade in={true} timeout={1500}>
      <Box>
        <OverdueDeathsDisplay />
      </Box>
    </Fade>
  );
};
