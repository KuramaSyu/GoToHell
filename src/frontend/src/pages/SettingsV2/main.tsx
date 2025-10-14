import * as React from 'react';
import {
  Box,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
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
import { useEffect } from 'react';

// ---- Notes ----
// 1) Replace the demo settings sections with your real forms/controls.
// 2) If your app uses React Router, you can easily make the mobile drill-in navigable
//    via routes like "/settings/:section" instead of component state.
// 3) The left rail uses position:sticky to keep it fixed under your AppBar.
//    Adjust the `top` value to match your AppBar height.
// 4) The scroll sync uses IntersectionObserver tuned to favor the section near the top.
// 5) The scrollMarginTop on each section ensures a nice offset when using scrollIntoView.

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
};

export type SettingsSectionProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

// A simple section wrapper to give each section consistent spacing and an anchor target
const SettingsSection = React.forwardRef<HTMLDivElement, SettingsSectionProps>(
  ({ id, label, children }, ref) => (
    <Box id={id} ref={ref} sx={{ scrollMarginTop: 80, mb: 6 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {label}
      </Typography>
      <Box>{children}</Box>
      <Divider sx={{ mt: 4 }} />
    </Box>
  )
);
SettingsSection.displayName = 'SettingsSection';

// ---- Demo content (replace with your real settings forms) ----
function AccountSettings() {
  return (
    <Box>
      <Typography variant="body1">
        Account details, email, password reset, two-factor auth, etc.
      </Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function SecuritySettings() {
  return (
    <Box>
      <Typography variant="body1">
        Security options, sessions, devices.
      </Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function NotificationsSettings() {
  return (
    <Box>
      <Typography variant="body1">
        Notification preferences for email, push, and in-app.
      </Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

function AppearanceSettings() {
  return (
    <Box>
      <Typography variant="body1">Theme, density, and language.</Typography>
      <Box sx={{ height: 400 }} />
    </Box>
  );
}

// ---- The main page component ----
export default function SettingsPage() {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const { isLoading, setLoading } = useLoadingStore();

  // Define your categories once
  const categories = React.useMemo<SettingsCategory[]>(
    () => [
      { id: 'account', label: 'Account', icon: <SettingsIcon /> },
      { id: 'security', label: 'Security', icon: <SecurityIcon /> },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <NotificationsIcon />,
      },
      { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
    ],
    []
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
      new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .add(ApiRequirement.Preferences)
        .fetchIfNeeded();
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
      }
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
          bgcolor: theme.palette.muted.dark,
        }}
      >
        <Box sx={{ p: 2, position: 'sticky', top: 0 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
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
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* All sections rendered in one flow */}
        <SettingsSection
          id="account"
          label="Account"
          ref={(el) => {
            sectionRefs.current['account'] = el;
          }}
        >
          <AccountSettings />
        </SettingsSection>
        <SettingsSection
          id="security"
          label="Security"
          ref={(el) => {
            sectionRefs.current['security'] = el;
          }}
        >
          <SecuritySettings />
        </SettingsSection>
        <SettingsSection
          id="notifications"
          label="Notifications"
          ref={(el) => {
            sectionRefs.current['notifications'] = el;
          }}
        >
          <NotificationsSettings />
        </SettingsSection>
        <SettingsSection
          id="appearance"
          label="Appearance"
          ref={(el) => {
            sectionRefs.current['appearance'] = el;
          }}
        >
          <AppearanceSettings />
        </SettingsSection>
        <Box sx={{ height: 60 }} />
      </Grid>
    </Grid>
  );

  // ---- Mobile layout ----
  const MobileCategories = (
    <Box>
      <Typography variant="h6" sx={{ px: 2, pb: 1 }}>
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
        <IconButton aria-label="Back" onClick={() => setMobileOpenId(null)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          {categories.find((c) => c.id === mobileOpenId)?.label}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        {mobileOpenId === 'account' && (
          <SettingsSection id="account-mobile" label="Account">
            <AccountSettings />
          </SettingsSection>
        )}
        {mobileOpenId === 'security' && (
          <SettingsSection id="security-mobile" label="Security">
            <SecuritySettings />
          </SettingsSection>
        )}
        {mobileOpenId === 'notifications' && (
          <SettingsSection id="notifications-mobile" label="Notifications">
            <NotificationsSettings />
          </SettingsSection>
        )}
        {mobileOpenId === 'appearance' && (
          <SettingsSection id="appearance-mobile" label="Appearance">
            <AppearanceSettings />
          </SettingsSection>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Optional: put your <AppBar /> above this component */}
      {isMobile
        ? mobileOpenId
          ? MobileSection
          : MobileCategories
        : DesktopLayout}
    </Box>
  );
}
