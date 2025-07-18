import React, { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';

// default swagger-ui styles
import 'swagger-ui-react/swagger-ui.css';

// override with one of swagger-ui-themes
import 'swagger-ui-themes/themes/3.x/theme-outline.css';
import { BACKEND_BASE } from '../../statics';
import { Box, GlobalStyles, styled } from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';
import {
  ApiRequirement,
  ApiRequirementsBuilder,
} from '../../utils/api/ApiRequirementsBuilder';
import { useUserStore } from '../../userStore';

export const SwaggerDocs: React.FC = () => {
  const { theme, setTheme, initializeTheme } = useThemeStore();
  const { user } = useUserStore();

  useEffect(() => {
    async function init() {
      await setTheme('docsTheme');
    }
    init();
  }, [theme]);

  useEffect(() => {
    async function init() {
      await new ApiRequirementsBuilder()
        .add(ApiRequirement.User)
        .fetchIfNeeded();
    }
    init();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup function to reset the theme when the component unmounts
      initializeTheme();
    };
  }, []);
  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        overflow: 'scroll',
        height: '100%',
      }}
    >
      <Box sx={{ mb: 1 }}>
        <SwaggerUI url={`${BACKEND_BASE}/api/swagger/doc.json`} />
      </Box>
    </Box>
  );
};
