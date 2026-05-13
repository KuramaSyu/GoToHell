import {
  alpha,
  Box,
  darken,
  Fade,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
import TouchApp from '@mui/icons-material/TouchApp';
import { useThemeStore } from '../../zustand/useThemeStore';
import { PopNumber } from './PopNumber';
import { NUMBER_FONT } from '../../statics';
import { blendWithContrast } from '../../utils/blendWithContrast';
import { useOverdueDeathsStore } from '../../zustand/OverdueDeathsStore';
import { useEffect, useRef, useState } from 'react';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { hexToRgbString } from '../../utils/colors/hexToRgb';

export const OverdueDeathsDisplay: React.FC = () => {
  const { theme } = useThemeStore();
  const { overdueDeathsList, lockDecrement, setLockDecrement } =
    useOverdueDeathsStore();

  // whether or not the display is hovered
  const [isHovered, setIsHovered] = useState(false);

  // state which is for 5s true, after lockDecrement changed
  const [showAfterChange, setShowAfterChange] = useState(false);

  // timer which is used to set showAfterChange back to false after 5s
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function init() {
      new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.OverdueDeaths)
        .fetchIfNeeded();
    }
    init();
  }, []);

  /**
   * useEffect with timer, used to display the lock icon
   * 5s after a change to lockDecrement
   */
  useEffect(() => {
    setShowAfterChange(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setShowAfterChange(false);
      hideTimerRef.current = null;
    }, 5000);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [lockDecrement]);

  /**
   * When the user clicks the overdue deaths display,
   * toggle the lock decrement option, which makes it so that uploading
   * a death does not decrement the overdue deaths count.
   * This should also grey out the display and add a lock icon in the top middle
   */
  const onToggleDecrementLock = () => {
    // toggle lock decrement
    setLockDecrement(!lockDecrement);
  };

  const showLockIcon = lockDecrement || isHovered || showAfterChange;

  return (
    <Stack direction={'row'} spacing={2} height={'100%'} alignItems={'center'}>
      <Tooltip
        title={
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <TouchApp sx={{ fontSize: '18px' }} />
            <span>
              {lockDecrement
                ? 'Uploading will NOT decrement the Overdue-Deaths-Count'
                : 'Uploading will decrement the Overdue-Deaths-Count'}
            </span>
          </Stack>
        }
      >
        <Box
          sx={{
            ...theme.colorTransition.root,
            px: 2,
            py: 1,

            // normal colorful background when unlocked, greyed out when locked
            backgroundColor: !lockDecrement
              ? theme.blendAgainstContrast('secondary', 0.4)
              : theme.changeSaturation(
                  theme.blendAgainstContrast('secondary', 0.4),
                  -0.9,
                ),
            borderRadius: '40px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Fade in={showLockIcon} timeout={theme.transitions.duration.complex}>
            <Box
              sx={{
                ...theme.colorTransition.root,

                // middle positioned at the top of the display
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',

                // center icon in middle
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                // size and rounding
                width: '28px',
                height: '28px',
                borderRadius: '999px',

                // color
                backgroundColor: theme.blendAgainstContrast('secondary', 0.25),
                color: theme.blendWithContrast('secondary', 0.5),
                pointerEvents: 'none',
              }}
            >
              {lockDecrement ? (
                <Lock sx={{ fontSize: '18px' }} />
              ) : (
                <LockOpen sx={{ fontSize: '18px' }} />
              )}
            </Box>
          </Fade>
          <Box
            onClick={onToggleDecrementLock}
            sx={{
              display: 'flex',
              overflow: 'hidden',
              height: '110px', // crafted to match the multiplier and pop number font + size combo, since it has a weird margin at the bottom
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
      </Tooltip>
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
