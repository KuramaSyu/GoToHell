import { alpha, Box, duration, Modal, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useThemeStore } from '../../zustand/useThemeStore';
import SearchIcon from '@mui/icons-material/Search';
import { Title } from '@mui/icons-material';
import { animated, useTransition } from 'react-spring';
import { transform } from 'framer-motion';

const AnimatedBox = animated(Box);

export interface QuickActionEntryProps {
  title: string;
  keys: string;
}

export const QuickActionEntry: React.FC<QuickActionEntryProps> = ({
  title,
  keys,
}) => {
  const { theme } = useThemeStore();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        borderRadius: 5,
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ fontSize: '3vh' }}>{title}</Box>
      <Box sx={{ fontSize: '2vh' }}>{keys}</Box>
    </Box>
  );
};

export const QuickActionMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { theme } = useThemeStore();

  const transitions = useTransition(open, {
    from: { opacity: 0, transform: 'translateY(-50px) translateX(-50%)' },
    enter: { opacity: 1, transform: 'translateY(0px) translateX(-50%)' },
    leave: { opacity: 0, transform: 'translateY(-50px) translateX(-50%)' },
    config: (item, index, state) =>
      state === 'enter'
        ? { tension: 250, friction: 18 } // bouncy fade in
        : { duration: 150 }, // ease out
    onStart: () => {
      if (open) setVisible(true);
    },
    onRest: () => {
      if (!open) setVisible(false);
    },
    exitBeforeEnter: true,
    immediate: (state) => state === 'leave' && open,
  });
  // keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        e.stopPropagation();
        setOpen((old_value) => !old_value);
      }
      if (e.key === 'a') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <Modal
      open={visible}
      onClose={() => setOpen(false)}
      hideBackdrop // { backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.2)' } } }
    >
      {transitions((style, item) =>
        item ? (
          <AnimatedBox
            style={style}
            sx={{
              position: 'absolute',
              top: '5%',
              left: '50%',
              width: '80%',
              height: '20%',
              backgroundColor: alpha('#000000', 0.6),
              outline: 'none',
              borderRadius: 5,
              justifyContent: 'center',
              justifyItems: 'center',
              alignItems: 'center',
              alignContent: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                justifyContent: 'center',
                justifyItems: 'center',
                px: 3,
                display: 'flex',
                fontSize: '4vh',
              }}
            >
              Quick Actions
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-around',
                py: 2,
              }}
            >
              <QuickActionEntry keys="Any Number" title="Exercises" />
              <QuickActionEntry keys="Any Letter" title="Sport Kind" />
              <QuickActionEntry keys="Enter" title="Upload" />
            </Box>
          </AnimatedBox>
        ) : null
      )}
    </Modal>
  );
};
