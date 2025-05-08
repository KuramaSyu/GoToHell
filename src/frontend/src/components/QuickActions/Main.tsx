import {
  alpha,
  Box,
  Button,
  duration,
  Icon,
  Modal,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useThemeStore } from '../../zustand/useThemeStore';
import SearchIcon from '@mui/icons-material/Search';
import {
  Backspace,
  Height,
  SvgIconComponent,
  Title,
} from '@mui/icons-material';
import { animated, useTransition } from 'react-spring';
import { transform } from 'framer-motion';
import AbcIcon from '@mui/icons-material/Abc';
import PinIcon from '@mui/icons-material/Pin';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DialpadIcon from '@mui/icons-material/Dialpad';
import React from 'react';
import { ModalOverview } from './ModalOverviewCards';
import { SearchModal } from './SearchModal';
import { isNumeric } from '../../utils/UserNumber';
import { AmountModal } from './AmountModal';
import useUploadStore from '../../zustand/UploadStore';
import usePreferenceStore from '../../zustand/PreferenceStore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AppsIcon from '@mui/icons-material/Apps';

const AnimatedBox = animated(Box);

export const QuickActionMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { theme } = useThemeStore();
  const [typed, SetTyped] = useState<string | null>(null);
  const [page, setPage] = useState('overview');
  const { triggerUpload } = useUploadStore();
  const { preferences } = usePreferenceStore();

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
      if (!open) {
        setVisible(false);
        SetTyped(null);
      }
    },
    exitBeforeEnter: true,
    immediate: (state) => state === 'leave' && open,
  });

  // opening keyboard listener
  useEffect(() => {
    const alphanumericRegex = /^[a-zA-Z0-9]$/;
    const isAlphanumberic = (e: KeyboardEvent): boolean => {
      return (
        alphanumericRegex.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey
      );
    };
    const INSTANT_OPEN = preferences.other.instant_open_modal;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle opening/closing first
      if (e.key === '/') {
        e.preventDefault();
        e.stopPropagation();
        // Toggle open state and reset typed state if opening
        setOpen((currentOpen) => {
          if (!currentOpen) {
            SetTyped(null); // Reset typed when opening
            setPage('overview'); // Ensure starting page is overview
          }
          return !currentOpen;
        });
        return; // Don't process '/' further for typing
      } else if (INSTANT_OPEN && !open && isAlphanumberic(e)) {
        setOpen(true);
        processTyping(e);
      }

      if (e.key === 'Escape') {
        // Handle closing with Escape key
        setOpen(false);
        return;
      }

      // Handle typing only if the modal is currently open
      if (open) processTyping(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const processTyping = (e: KeyboardEvent) => {
    // Basic check for printable characters (length 1)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      SetTyped((prev) => (prev ? prev + e.key : e.key));
    } else if (e.key === 'Backspace' && e.ctrlKey) {
      // Handle full delete
      SetTyped(null);
    } else if (e.key === 'Backspace') {
      // Handle backspace
      SetTyped((prev) => (prev ? prev.slice(0, -1) : null));
    }
  };
  // change window when something was typed
  useEffect(() => {
    if (typed?.length ?? 0 > 0) {
      // something was typed -> either sport or amount modal
      if (isNumeric(typed![0]!)) {
        // first character is a number -> amount modal
        setPage('AmountModal');
      } else {
        // first character is a letter -> sport modal
        setPage('SportSearch');
      }
    } else {
      // nothing was typed -> overview
      setPage('overview');
    }
  }, [typed]);

  // Listen for Enter to trigger upload and close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || page !== 'overview') return; // Only listen when modal is open

      if (e.key === 'Enter') {
        triggerUpload();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [typed, open, page]);

  const pageTransitions = useTransition(page, {
    from: { opacity: 0, transform: 'scale(0.7)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    // better without leave animation
    config: (_item, _index, state) =>
      state === 'enter' ? { tension: 350, friction: 25 } : { duration: 150 },
  });

  const overviewButton = (
    <Button
      variant="outlined"
      onClick={() => setPage('overview')}
      sx={{
        display: 'flex',
        justifyContent: 'end',
        gap: 1,
        px: 2,
        fontSize: '1.5vh',
      }}
    >
      Overview
      <AppsIcon
        sx={{
          height: '2vh',
          width: 'auto',
        }}
      />
    </Button>
  );
  const exitButton = (
    <Button
      variant="outlined"
      onClick={() => setOpen(false)}
      sx={{
        display: 'flex',
        justifyContent: 'end',
        gap: 1,
        px: 2,
        fontSize: '1.5vh',
      }}
    >
      ESC
      <ExitToAppIcon
        sx={{
          height: '2vh',
          width: 'auto',
        }}
      />
    </Button>
  );
  return (
    <Modal
      open={visible}
      onClose={() => setOpen(false)}
      sx={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.2)' } } }}
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
              backgroundColor: alpha(theme.palette.muted.main, 0.5),
              border: `4px solid ${alpha(theme.palette.muted.main, 0.55)}`,
              backdropFilter: 'blur(8px)',
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
                justifyContent: 'space-between',
                width: '100%',
                px: 3,
                display: 'flex',
                fontSize: '4vh',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'start',
                  alignItems: 'center',
                }}
              >
                {page !== 'overview' ? overviewButton : null}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Quick Actions
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'center',
                }}
              >
                {exitButton}
              </Box>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
              }}
            >
              {pageTransitions((style, currentPage) => (
                <AnimatedBox
                  style={{
                    ...style,
                    display: 'flex',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {currentPage === 'overview' ? (
                    <ModalOverview key="overview" />
                  ) : currentPage === 'SportSearch' ? (
                    <SearchModal
                      key="search"
                      typed={typed}
                      setTyped={SetTyped}
                      page={page}
                      setPage={setPage}
                    />
                  ) : currentPage === 'AmountModal' ? (
                    <AmountModal
                      key="search"
                      typed={typed}
                      setTyped={SetTyped}
                      page={page}
                      setPage={setPage}
                    />
                  ) : (
                    <Box sx={{ flexGrow: 1 }}></Box>
                  )}
                </AnimatedBox>
              ))}
            </Box>
          </AnimatedBox>
        ) : null
      )}
    </Modal>
  );
};
