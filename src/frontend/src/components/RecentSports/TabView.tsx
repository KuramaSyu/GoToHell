import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { RecentSportsStandard } from './Standard';
import { RecentSportsTimeline } from './Timeline';

export const RecentSports = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleChange} centered>
        <Tab label="Standard View" />
        <Tab label="Timeline View" />
      </Tabs>
      <Box mt={2}>
        {activeTab === 0 && <RecentSportsStandard />}
        {activeTab === 1 && <RecentSportsTimeline />}
      </Box>
    </Box>
  );
};
