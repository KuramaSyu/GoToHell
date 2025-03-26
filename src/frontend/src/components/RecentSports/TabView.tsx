import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { RecentSportsStandard } from './Standard';

export const RecentSports = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="left"
      alignContent="left"
    >
      <Box display="flex" justifyContent="center">
        <Tabs
          value={activeTab}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Standard View" sx={{ minWidth: 150, width: 'auto' }} />
          {/* <Tab label="Timeline View" sx={{ minWidth: 150, width: 'auto' }} /> */}
        </Tabs>
      </Box>
      <Box mt={2} display="flex" justifyContent="left">
        {activeTab === 0 && <RecentSportsStandard />}
        {/* {activeTab === 1 && <HorizontalSportsTimeline />} */}
      </Box>
    </Box>
  );
};
