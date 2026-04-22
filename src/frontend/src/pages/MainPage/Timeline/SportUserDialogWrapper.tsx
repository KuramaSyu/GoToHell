import {
  alpha,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Input,
  Slide,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useUsersStore, useUserStore } from '../../../userStore';
import { useEffect, useState } from 'react';

import SyncIcon from '@mui/icons-material/Sync';
import React from 'react';
import { TransitionProps } from '@mui/material/transitions';
import useInfoStore, { SnackbarUpdateImpl } from '../../../zustand/InfoStore';
import { SportDialog } from './SportDialog';
import { UserSport, UserSportGroup } from './models/SportModels';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useThemeStore } from '../../../zustand/useThemeStore';
import { UserProfileMain } from '../../../components/UserProfile/Main';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

interface SportUserDialogWrapperProps {
  selectedSport: UserSport | UserSportGroup | null;
  setSelectedSport: React.Dispatch<
    React.SetStateAction<UserSport | UserSportGroup | null>
  >;
}

export const SportUserDialogWrapper: React.FC<SportUserDialogWrapperProps> = ({
  selectedSport,
  setSelectedSport,
}) => {
  const [tab, setTab] = useState(0);
  const { users } = useUsersStore();
  const { isMobile } = useBreakpoint();
  const { theme } = useThemeStore();
  const [activeGroup, setActiveGroup] = useState<UserSportGroup | null>(null);
  const paperSxDefault = {
    backdropFilter: 'blur(8px)',
    backgroundColor: alpha(theme.palette.primary.dark, 0.7),
    borderRadius: 1,
  } as any;
  const paperSxGroup = {
    backdropFilter: 'blur(8px)',
    backgroundColor: alpha(theme.palette.primary.dark, 0.85),
    borderRadius: 1,
    width: '95%',
    height: '85vh',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
  } as any;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (!selectedSport) return;
    // if a group was selected, switch to Group tab and remember it
    if ((selectedSport as any).entries) {
      setActiveGroup(selectedSport as UserSportGroup);
      setTab(1);
      return;
    }

    // If a single sport was selected while the Group tab is open and we have an activeGroup,
    // keep the Group tab visible so the right-hand preview can show the sport.
    if (tab === 1 && activeGroup) {
      return;
    }

    // otherwise switch to the Sport tab
    setTab(0);
  }, [selectedSport]);

  return (
    <Dialog
      open={selectedSport !== null}
      onClose={() => {
        setSelectedSport(null);
        setActiveGroup(null);
      }}
      fullScreen={isMobile}
      fullWidth
      maxWidth={tab === 1 ? 'lg' : 'sm'}
      slotProps={{
        paper: {
          sx: tab === 1 ? paperSxGroup : paperSxDefault,
        },
      }}
    >
      <Tabs value={tab} onChange={handleChange}>
        <Tab label='Sport' />
        <Tab label='Group' />
        <Tab label='User' />
      </Tabs>
      {tab === 0 ? (
        // only render Sport dialog when a single sport is selected
        selectedSport && !(selectedSport as any).entries ? (
          <SportDialog
            selectedSport={selectedSport as UserSport}
            setSelectedSport={setSelectedSport as any}
          />
        ) : null
      ) : tab === 1 ? (
        // Group tab: two-column layout. Left: list, Right: preview using SportDialog design
        (() => {
          const groupToShow: UserSportGroup | null =
            selectedSport && (selectedSport as any).entries
              ? (selectedSport as UserSportGroup)
              : activeGroup;
          const selectedEntryId =
            selectedSport && !(selectedSport as any).entries
              ? (selectedSport as UserSport).id
              : null;
          return groupToShow ? (
            <Box sx={{ display: 'flex', height: '100%' }}>
              <Box sx={{ width: '40%', overflowY: 'auto', pr: 2 }}>
                <DialogTitle sx={{ pb: 1 }}>
                  Group — {groupToShow.entries.length} entries
                </DialogTitle>
                <Divider />
                {groupToShow.entries.length > 1 && (
                  <Box
                    sx={{
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    {/** games overview */}
                    {Array.from(new Set(groupToShow.entries.map((e) => e.game)))
                      .length > 1 && (
                      <Typography variant='body2' color='text.secondary'>
                        Games:{' '}
                        {Array.from(
                          new Set(groupToShow.entries.map((e) => e.game)),
                        ).join(', ')}
                      </Typography>
                    )}
                    {/** how many games */}
                    <Typography variant='body2' color='text.secondary'>
                      Games played:{' '}
                      {
                        Array.from(
                          new Set(groupToShow.entries.map((e) => e.game)),
                        ).length
                      }
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Entries: {groupToShow.entries.length}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Users:{' '}
                      {
                        Array.from(
                          new Set(groupToShow.entries.map((e) => e.user_id)),
                        ).length
                      }
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Kinds:{' '}
                      {Array.from(
                        new Set(groupToShow.entries.map((e) => e.kind)),
                      ).join(', ')}
                    </Typography>
                  </Box>
                )}
                <List>
                  {groupToShow.entries.map((entry: UserSport) => (
                    <ListItem key={entry.id} disablePadding>
                      <ListItemButton
                        selected={selectedEntryId === entry.id}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: alpha(
                              theme.palette.secondary.main,
                              0.15,
                            ),
                          },
                        }}
                        onClick={() => {
                          setSelectedSport(entry);
                          // keep tab on Group so right panel shows preview
                        }}
                      >
                        <ListItemText
                          primary={`${entry.kind.replace('_', ' ')} — ${entry.amount}`}
                          secondary={new Date(entry.timedate).toLocaleString()}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box
                sx={{
                  width: '60%',
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  overflowY: 'auto',
                }}
              >
                {selectedEntryId ? (
                  <SportDialog
                    selectedSport={
                      groupToShow.entries.find(
                        (e) => e.id === selectedEntryId,
                      ) as UserSport
                    }
                    setSelectedSport={setSelectedSport as any}
                  />
                ) : (
                  <Box sx={{ p: 2 }}>Select an entry to preview</Box>
                )}
              </Box>
            </Box>
          ) : null;
        })()
      ) : tab === 2 ? (
        <UserProfileMain
          user={
            users[
              (selectedSport as any)?.user_id ??
                (selectedSport as any)?.entries?.[0]?.user_id
            ] ?? null
          }
        ></UserProfileMain>
      ) : null}
    </Dialog>
  );
};
