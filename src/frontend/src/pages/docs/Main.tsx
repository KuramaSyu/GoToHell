import React, { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';

// default swagger-ui styles
import 'swagger-ui-react/swagger-ui.css';

// override with one of swagger-ui-themes
import 'swagger-ui-themes/themes/3.x/theme-material.css';
import { BACKEND_BASE } from '../../statics';
import { Box } from '@mui/material';
import { useThemeStore } from '../../zustand/useThemeStore';

export const SwaggerDocs: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  useEffect(() => {
    async function init() {
      await setTheme('brightNord');
    }
    init();
  }, [theme]);
  return (
    <Box
      sx={{
        position: 'absolute',
        backgroundColor: theme.palette.background.default,
        height: '100vh',
        width: '100vw',
        zIndex: 1,
      }}
    >
      <SwaggerUI url={`${BACKEND_BASE}/api/swagger/doc.json`} />
    </Box>
  );
};
