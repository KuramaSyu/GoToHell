import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { MultiplierSettings } from "../../../pages/Settings/Multiplier";
import { useThemeStore } from "../../../zustand/useThemeStore";
import { SecondaryTabView } from "./SecondaryTabView";
import { hexToRgbString } from "../../../utils/colors/hexToRgb";

const SecondaryTabViewExists = (themeName: string) => {
  // simplified more intelligent version without tabs
  if (themeName === "custom") {
    return false;
  }
  return true;
};

export const RecentSports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useThemeStore();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        alignContent: "stretch",
        alignItems: "flex-end", // Add this to align children to bottom
        gap: 1,
        px: 2,
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="left"
        alignContent="flex-start"
        sx={{
          width: SecondaryTabViewExists(theme.custom.themeName)
            ? "60%"
            : "100%",
          transition: "width 0.3s ease-in-out",
        }}
      >
        {/* <Box display="flex" justifyContent="center">
          <Tabs
            value={activeTab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              backgroundColor: `rgba(${hexToRgbString(
                theme.palette.muted.dark
              )}, 0.33)`,
              borderRadius: '50px',
              padding: '5px',
              backdropFilter: 'blur(10px)',
              p: 1,
            }}
          >
            <Tab label="Multiplier" sx={{ minWidth: 150, width: 'auto' }} />
          </Tabs>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {activeTab === 0 && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
              }}
            >
              <MultiplierSettings />
            </Box>
          )}
        </Box>
      </Box>

      {SecondaryTabViewExists(theme.custom.themeName) && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="left"
          alignContent="flex-start"
          flexShrink={1}
          sx={{ width: 2 / 5 }}
        >
          <SecondaryTabView></SecondaryTabView>
        </Box>
      )}
    </Box>
  );
};
