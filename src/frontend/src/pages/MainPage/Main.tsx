import React, { useEffect, useState } from "react";
import { alpha, Box } from "@mui/material";

import { useThemeStore } from "../../zustand/useThemeStore";
import AppBackground from "../../components/AppBackground";
import MainContent from "./MainContent";
import { useUsersStore, useUserStore } from "../../userStore";
import { ThemeProvider } from "@emotion/react";
import { QuickActionMenu } from "./QuickActions/Main";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from "../../utils/api/ApiRequirementsBuilder";
import { TimelineWrapper } from "./RecentSports/TimelineWrapper";
import { LoadingPage } from "../LoadingPage/Main";
import { useLoadingStore } from "../../zustand/loadingStore";
import { AnimatePresence, motion } from "framer-motion";
import { hexToRgbString } from "../../utils/colors/hexToRgb";
import { LoginPage } from "../LoginPage/Main";
import { BoxElevation1 } from "../../theme/statics";

const MainPage: React.FC = () => {
  const { theme } = useThemeStore();
  const { isLoading } = useLoadingStore();
  const { addUser } = useUsersStore();
  const { user } = useUserStore();
  const { isMobile } = useBreakpoint();
  const [exitPercentage, setExitPercentage] = useState(
    Math.round(Math.random() * 100),
  );
  const oneOrZero = Math.round(exitPercentage / 100) * 100;

  useEffect(() => {
    (async () => {
      try {
        await new ApiRequirementsBuilder()
          .add(ApiRequirement.User)
          .add(ApiRequirement.Friends)
          .add(ApiRequirement.Preferences)
          .fetchIfNeeded();
      } catch (e) {
        console.info(
          "Failed to fetch either user, friends or preferences. User probably not logged in.",
        );
      }
    })();
  }, []);
  // add current user to user array
  useEffect(() => {
    if (user != null) {
      addUser(user);
    }
  }, [user]);

  // Box for the Desktop-Timeline on the right Side.
  // Within the box is the timeline wrapper which shows either the
  // streak display or the actual timeline.
  const TimelineBox =
    isMobile || isLoading ? null : (
      <Box
        sx={{
          width: "clamp(300px, 25%, 420px)",
          height: "100%",
          flex: "0 1 auto",
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          overflow: "hidden", // Hide overflow on parent
          display: "flex",
          flexDirection: "column",
          ...BoxElevation1(theme),
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto", // Scrollbar only on inner box
          }}
        >
          <TimelineWrapper />
        </Box>
      </Box>
    );

  return (
    <ThemeProvider theme={theme}>
      {/* Loading Animation for Loading Page
      which is as long visible as "overlay" as
      it needs to fetch all resources via REST. */}
      <AnimatePresence initial={false}>
        {isLoading && (
          <motion.div
            initial={false}
            animate={{ clipPath: "circle(100% at 50% 50%)" }}
            exit={{
              clipPath: oneOrZero
                ? `circle(0% at 100% ${exitPercentage}%)`
                : `circle(0% at ${exitPercentage}% 100%)`,
              opacity: 0.2,
            }}
            transition={{
              duration: 1,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              position: "fixed",
              zIndex: 9999,
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <LoadingPage></LoadingPage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Box for either the Main App or Login Page, depending on user state */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          overflow: "hidden", // Prevents overflow
          paddingTop: user !== null && !isMobile ? "6px" : undefined,
        }}
      >
        {user !== null || isLoading ? (
          // load main content
          <>
            <AppBackground></AppBackground>

            {TimelineBox}
            <Box sx={{ flex: "1 1 auto", height: "100%", overflow: "hidden" }}>
              {!isLoading && <MainContent />}
            </Box>
          </>
        ) : (
          // load login page
          <>
            {console.log("render login page")}
            <LoginPage></LoginPage>
          </>
        )}
      </Box>
      <QuickActionMenu></QuickActionMenu>
    </ThemeProvider>
  );
};

export default MainPage;
