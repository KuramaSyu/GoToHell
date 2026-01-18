import React from "react";
import { alpha, Box, Divider, useMediaQuery } from "@mui/material";
import { GameSelector } from "./GameSelect";
import { NumberSlider } from "./NumberSlider";
import { UploadScore } from "./UploadScore";
import { TotalScoreDisplay } from "./TotalScoreDisplay";
import { SportSelector } from "./SportSelect";
import { RecentSports } from "./RecentSports/TabView";
import { useThemeStore } from "../../zustand/useThemeStore";
import { AmountDisplay } from "./AmountDisplay";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { UploadOverdueDeaths } from "./UploadOverdueDeaths";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { Pages } from "../../components/TopBar";
import { HistoryPills } from "./HistoryPills";
import { BoxElevation2 } from "../../theme/statics";

interface MainContentProps {
  theme: any;
}

const MainContent: React.FC = () => {
  const { theme } = useThemeStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedLeft: () => navigate(Pages.FRIENDS),
    onSwipedRight: () => navigate(Pages.HISTORY),
  });

  if (isMobile) {
    return (
      <Box
        {...handlers}
        sx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "100%" : "92vh",
          justifyContent: "space-between",
          touchAction: "pan-y",
        }}
      >
        {/* top row */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            justifyItems: "center",
            px: 1,
            height: 1 / 5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TotalScoreDisplay />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AmountDisplay />
          </Box>
        </Box>

        {/* box for middle row */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            flexGrow: 1,
            justifyContent: "space-around",
          }}
        >
          {/* Game Selection */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <GameSelector />
            <HistoryPills />
          </Box>

          {/* Death Slider and Upload */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              maxHeight: isMobile ? undefined : 1 / 5,
              height: isMobile ? 1 / 7 : undefined,
              mx: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                width: isMobile ? 3 / 4 : 3 / 4,
                zIndex: 0,
              }}
            >
              <NumberSlider
                withInput={
                  theme.custom.themeName === "custom" ? "custom" : "default"
                }
              />
            </Box>
            <Box
              sx={{
                width: isMobile ? 6 / 20 : 1 / 4,
                display: "flex",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <UploadScore />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SportSelector />
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column",
        height: "92vh",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      {/* top row */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          justifyItems: "center",
          px: 5,
          pt: 2,
          height: "20%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TotalScoreDisplay />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AmountDisplay />
        </Box>
      </Box>

      {/* box for middle row */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          ...BoxElevation2(theme),
          mx: 2,
          py: 2,
          borderRadius: 4,
          minHeight: 0,
        }}
      >
        {/* Game Selection */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 1 / 3,
          }}
        >
          <GameSelector />
        </Box>
        <Divider orientation="vertical" flexItem />

        {/* Death Slider and Upload */}
        <Box
          sx={{
            width: 1 / 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <NumberSlider
            withInput={
              theme.custom.themeName === "custom" ? "custom" : "default"
            }
          />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                // flexDirection: 'row',
                justifyContent: "center",
                width: "fit-content",
              }}
            >
              <UploadScore />
              <Box
                sx={{
                  position: "absolute",
                  bottom: "-30%",
                  right: "-12%",

                  zIndex: 1,
                }}
              >
                <UploadOverdueDeaths></UploadOverdueDeaths>
              </Box>
            </Box>
          </Box>
        </Box>
        <Divider orientation="vertical" flexItem />

        {/* Sport Selection */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 1 / 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SportSelector />
        </Box>
      </Box>
      {/* Box for Multiplier / 3rd info */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          zIndex: 1,
          pb: 2,
        }}
      >
        <RecentSports></RecentSports>
      </Box>
    </Box>
  );
};

export default MainContent;
