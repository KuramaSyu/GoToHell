import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { useLoadingStore } from '../../zustand/loadingStore';
import { useEffect, useState } from 'react';
import {
  GameOverrideList,
  GameOverrideSettings,
} from '../Settings/GameOverride';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { Pages } from '../../components/TopBar';
import FlagIcon from '@mui/icons-material/Flag';
import { PersonalGoalSettings } from './PersonalGoalSettings';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import {
  ResetSportAdjustmentsLogic,
  SportAdjustments,
} from './SportAdjustments';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
/**
 *
 * SettingsPage
 *
 * Desktop: two-pane layout
 *  - Left: categories list (sticky)
 *  - Right: one long scrollable content with all sections
 *  - Left highlight syncs with the section currently in view; clicking a category scrolls to that section
 *
 * Mobile: drill-in
 *  - First screen shows only the list of categories
 *  - Tapping a category opens that single section with a back button
 */

// ---- Types ----
export type SettingsCategory = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  resetLogic?: () => void;
  settingsContent?: React.ReactNode;
};

export type SettingsSectionProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  resetLogic?: () => void;
};

// A simple section wrapper to give each section consistent spacing and an anchor target
export const SettingsSection = React.forwardRef<
  HTMLDivElement,
  SettingsSectionProps
>(({ id, label, children, resetLogic }, ref) => {
  // to rerender children on reset
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    if (resetLogic) {
      resetLogic();
      setResetKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <Box id={id} ref={ref} sx={{ scrollMarginTop: 80, mb: 6 }}>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography variant='h6'>{label}</Typography>
        {resetLogic && (
          <Tooltip title={`Reset ${label} Settings`} arrow placement='top'>
            <IconButton
              aria-label='reset settings'
              onClick={handleReset}
              color='warning'
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Box key={resetKey}>{children}</Box>
      <Divider sx={{ mt: 4 }} />
    </Box>
  );
});
SettingsSection.displayName = 'SettingsSection';

// ---- Demo content (replace with your real settings forms) ----
function AccountSettings() {
  return (
    <Box>
      <Typography variant='body1'>
        Account details, email, password reset, two-factor auth, etc.
      </Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function SecuritySettings() {
  return (
    <Box>
      <Typography variant='body1'>
        Security options, sessions, devices.
      </Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function NotificationsSettings() {
  return (
    <Box>
      <Typography variant='body1'>
        Notification preferences for email, push, and in-app.
      </Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function AppearanceSettings() {
  return (
    <Box>
      <Typography variant='body1'>Theme, density, and language.</Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function ExcerciseOverrideSettings() {
  return (
    <Box>
      <Typography variant='body1'>
        Exercise-Amount overrides for games.
      </Typography>
      <GameOverrideSettings />
      <GameOverrideList />
    </Box>
  );
}

function SportAdjustmenteSettings() {
  const { theme } = useThemeStore();
  return (
    <Stack direction={'column'} gap={theme.spacing(2)}>
      <Typography variant='body1'>
        You suck at Planks, but you are good at Push-Ups? Here you can Adjust
        the amount of exercises of a specific sport. For example you could lower
        the rating for Planks but increase it for Push-Ups
      </Typography>
      <SportAdjustments />
    </Stack>
  );
}

// ---- The main page component ----
export default function SettingsPage() {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const { isLoading, setLoading } = useLoadingStore();
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedRight: () => navigate(Pages.FRIENDS),
  });

  // Define your categories once
  const categories = React.useMemo<SettingsCategory[]>(
    () => [
      // {
      //   id: 'account',
      //   label: 'Account',
      //   icon: <SettingsIcon />,
      //   settingsContent: <AccountSettings />,
      // },
      {
        id: 'exercise-overrides',
        label: 'Exercise Overrides',
        icon: <SettingsIcon />,
        settingsContent: <ExcerciseOverrideSettings />,
      },

      {
        id: 'personal-goals',
        label: 'Personal Goals',
        icon: <FlagIcon />,
        settingsContent: <PersonalGoalSettings />,
      },
      {
        id: 'sport-adjustments',
        label: 'Sport Adjustments',
        icon: <FitnessCenterIcon />,
        resetLogic: ResetSportAdjustmentsLogic,
        settingsContent: <SportAdjustmenteSettings />,
      },
    ],
    [],
  );

  // Store refs for each section to support scrolling
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Active section (for desktop highlight)
  const [activeId, setActiveId] = React.useState<string>(categories[0]!.id);

  // Mobile drill-in state
  const [mobileOpenId, setMobileOpenId] = React.useState<string | null>(null);

  // initally load api requirements
  useEffect(() => {
    async function init() {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.Preferences)
        .fetchIfNeeded();

      await new ApiRequirementsBuilder()
        .add(ApiRequirement.UserPersonalGoals)
        .forceFetch();
    }
    init();
    setLoading(false);
    return () => {
      setLoading(true); // enable loading screen for loading friends, theme and so on
    };
  }, []);

  // Observe sections to sync left highlight while scrolling
  useEffect(() => {
    if (isMobile) return; // Only needed on desktop

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id && visible.target.id !== activeId) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-80px 0px -60% 0px', // favor the section near the top
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    const nodes = categories
      .map((c) => document.getElementById(c.id))
      .filter(Boolean) as HTMLElement[];

    nodes.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categories, isMobile, activeId]);

  const handleCategoryClick = (id: string) => {
    if (isMobile) {
      setMobileOpenId(id);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sticky left rail width
  const railWidth = 280;

  // ---- Desktop layout ----
  const DesktopLayout = (
    <Grid container>
      {/* Left rail */}
      <Grid
        size={{ xs: 12, md: 3, lg: 3 }}
        sx={{
          maxWidth: railWidth,
          flexBasis: railWidth,
          display: { xs: 'none', md: 'block' },
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ p: 2, position: 'sticky', top: 0 }}>
          <Typography variant='h5' sx={{ mb: 1 }}>
            Settings
          </Typography>

          <Divider />
          <List disablePadding>
            {categories.map((c) => (
              <ListItemButton
                key={c.id}
                selected={activeId === c.id}
                onClick={() => handleCategoryClick(c.id)}
              >
                {c.icon && <ListItemIcon>{c.icon}</ListItemIcon>}
                <ListItemText primary={c.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Grid>

      {/* Right content (all sections) */}
      <Grid
        size={{ xs: 12, md: 9 }}
        sx={{
          ml: { md: 2 },
          px: { xs: 2, md: 4 },
          pt: 4,
          pb: '50vh',
          height: '100vh',
          overflowY: 'auto',
          //width: '100%',
        }}
      >
        {categories.map((c) => (
          <SettingsSection
            id={c.id}
            label={c.label}
            ref={(el) => {
              sectionRefs.current[c.id] = el;
            }}
            resetLogic={c.resetLogic}
          >
            {c.settingsContent}
          </SettingsSection>
        ))}

        <Box sx={{ height: 60 }} />
      </Grid>
    </Grid>
  );

  // ---- Mobile layout ----
  const MobileCategories = (
    <Box>
      <Typography variant='h6' sx={{ px: 2, pb: 1 }}>
        Settings
      </Typography>
      <Divider />
      <List>
        {categories.map((c) => (
          <ListItemButton key={c.id} onClick={() => handleCategoryClick(c.id)}>
            {c.icon && <ListItemIcon>{c.icon}</ListItemIcon>}
            <ListItemText primary={c.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const MobileSection = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5 }}>
        <IconButton aria-label='Back' onClick={() => setMobileOpenId(null)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h6' sx={{ ml: 1 }}>
          {categories.find((c) => c.id === mobileOpenId)?.label}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        {categories
          .filter((c) => c.id === mobileOpenId)
          .map((c) => (
            <SettingsSection
              key={`${c.id}-mobile`}
              id={`${c.id}-mobile`}
              label={c.label}
              resetLogic={c.resetLogic}
            >
              {c.settingsContent}
            </SettingsSection>
          ))}
      </Box>
    </Box>
  );

  return (
    <Box
      {...handlers}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {isMobile
        ? mobileOpenId
          ? MobileSection
          : MobileCategories
        : DesktopLayout}
    </Box>
  );
}
