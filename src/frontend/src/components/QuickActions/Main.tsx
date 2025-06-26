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
import { ModalOverview, ModalPages } from './ModalOverviewCards';
import { SearchModal } from './SearchModal';
import { isNumeric } from '../../utils/UserNumber';
import { AmountModal } from './AmountModal';
import useUploadStore from '../../zustand/UploadStore';
import usePreferenceStore from '../../zustand/PreferenceStore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AppsIcon from '@mui/icons-material/Apps';
import { UploadModal } from './UploadModal';

const AnimatedBox = animated(Box);

type OpenState = {
  open: boolean;
  openedAt?: Date;
};

export const QuickActionMenu: React.FC = () => {
  const MIN_OPEN_DURATION = 1000; // Minimum time the modal should stay open
  const [open, setOpen] = useState<OpenState>({ open: false });
  const [visible, setVisible] = useState(false);
  const { theme } = useThemeStore();
  const [typed, SetTyped] = useState<string | null>(null);
  const [page, setPage] = useState('overview');
  const { triggerUpload } = useUploadStore();
  const { preferences } = usePreferenceStore();

  const transitions = useTransition(open.open, {
    from: { opacity: 0, transform: 'translateY(-50px) translateX(-50%)' },
    enter: { opacity: 1, transform: 'translateY(0px) translateX(-50%)' },
    leave: { opacity: 0, transform: 'translateY(-50px) translateX(-50%)' },
    config: (item, index, state) =>
      state === 'enter'
        ? { tension: 250, friction: 18 } // bouncy fade in
        : { duration: 150 }, // ease out
    onStart: () => {
      if (open.open) setVisible(true);
    },
    onRest: () => {
      if (!open.open) {
        setVisible(false);
        SetTyped(null);
      }
    },
    exitBeforeEnter: true,
    immediate: (state) => state === 'leave' && open.open,
  });

  function missingOpenTime(): number {
    if (!open.openedAt) return 0;
    const now = new Date();
    return Math.max(now.getTime() - open.openedAt.getTime(), 0);
  }

  function isOpenForMinimumDuration(): boolean {
    if (!open.openedAt) return true;
    const elapsed = missingOpenTime();
    return elapsed >= MIN_OPEN_DURATION;
  }

  /**
   * Un-focuses an element, if one is active. This is mainly used,
   * to prevent EnterKey from beeing registered from multiple components,
   * when modal is active
   */
  const unfocusCurrentElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      console.log(`unfocus ${document.activeElement}`);
      document.activeElement.blur();
    }
  };

  // keyboard listener, which starts the modal if A-Z, Enter, 0-9 was pressed
  // also, it ignores keystrokes, if a textfield is active
  useEffect(() => {
    const alphanumericRegex = /^[a-zA-Z0-9]$/;
    const isAlphanumbericOrReturn = (e: KeyboardEvent): boolean => {
      return (
        (alphanumericRegex.test(e.key) &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey) ||
        e.key === 'Enter'
      );
    };
    const INSTANT_OPEN = preferences.other.instant_open_modal;

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(
        `Key pressed: ${e.key}, alphanumeric: ${isAlphanumbericOrReturn(
          e
        )}, instant_open: ${INSTANT_OPEN}, open: ${open.open}`
      );
      // check if any input field is focused. If so, do not open the modal
      const active = document.activeElement;
      const isFormField =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active?.getAttribute('contenteditable') === 'true';
      if (isFormField) {
        console.log('Input field is focused, ignoring key press');
        return;
      }

      if (e.key === '/') {
        // open or close modal
        e.preventDefault();
        e.stopPropagation();
        // Toggle open state and reset typed state if opening
        setOpen((currentOpen) => {
          if (!currentOpen) {
            unfocusCurrentElement();
            SetTyped(null); // Reset typed when opening
            setPage('overview'); // Ensure starting page is overview
          }
          return { open: !currentOpen.open, openedAt: new Date() };
        });
        return; // Don't process '/' further for typing
      } else if (INSTANT_OPEN && !open.open && isAlphanumbericOrReturn(e)) {
        // a key was pressed and INSTANT_OPEN is active
        unfocusCurrentElement();
        console.log(`Opening modal due to key: ${e.key}`);
        setOpen({ open: true, openedAt: new Date() });
        processTyping(e);
      }

      if (e.key === 'Escape') {
        // Handle closing with Escape key
        setOpen({ open: false });
        return;
      }

      // Handle typing only if the modal is currently open
      if (open.open) processTyping(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, preferences.other.instant_open_modal]);

  // Effect which handles upload press
  useEffect(() => {
    if (page === ModalPages.UPLOAD_MODAL) {
      triggerUpload();

      // wait for minimum open duration before closing
      const timeout = setTimeout(() => {
        setPage(ModalPages.OVERVIEW);
        setOpen({ open: false });
      }, MIN_OPEN_DURATION - missingOpenTime());

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [page, triggerUpload]);

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
        setPage(ModalPages.AMOUNT_MODAL);
      } else {
        // first character is a letter -> sport modal
        setPage(ModalPages.SEARCH_MODAL);
      }
    } else {
      // nothing was typed -> overview
      setPage(ModalPages.OVERVIEW);
    }
  }, [typed]);

  // Listen for Enter to trigger upload and close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open.open || page !== ModalPages.OVERVIEW) return; // Only listen when modal is open

      if (e.key === 'Enter') {
        // upload was triggerd by keyboard
        setPage(ModalPages.UPLOAD_MODAL);
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
      onClick={() => setOpen({ open: false })}
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
      onClose={() => setOpen({ open: false })}
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
            {/* Header  */}
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

            {/* Content Area */}
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
                  {currentPage === ModalPages.OVERVIEW ? (
                    <ModalOverview
                      key="overview"
                      page={page}
                      setPage={setPage}
                    />
                  ) : currentPage === ModalPages.SEARCH_MODAL ? (
                    <SearchModal
                      key="search"
                      typed={typed}
                      setTyped={SetTyped}
                      page={page}
                      setPage={setPage}
                    />
                  ) : currentPage === ModalPages.AMOUNT_MODAL ? (
                    <AmountModal
                      key="search"
                      typed={typed}
                      setTyped={SetTyped}
                      page={page}
                      setPage={setPage}
                    />
                  ) : currentPage === ModalPages.UPLOAD_MODAL ? (
                    <UploadModal
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
