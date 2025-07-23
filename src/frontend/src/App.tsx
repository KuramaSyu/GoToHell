import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/DiscordLogin.css';
import '@mui/material/styles';
//import './App.css';
import MainPage from './components/Main';
import FriendOverview from './pages/friends/FriendOverview';
import TopBar from './components/TopBar';
import { Box, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import { useThemeStore } from './zustand/useThemeStore';
import InfoDisplay from './components/InfoDisplay';
import { Settings } from './pages/Settings/Main';
import { SwaggerDocs } from './pages/docs/Main';
// Import other components as needed

const App: React.FC = () => {
  const { theme } = useThemeStore();

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // Prevents content from growing beyond 100vh
            backgroundColor: theme.palette.muted.main,
          }}
        >
          {/* Fixed TopBar with auto height */}
          <Box sx={{ flexShrink: 0 }}>
            <TopBar />
            <Toolbar></Toolbar>
          </Box>

          {/* Main Content Area - MUST use flex: 1 to ensure correct height */}
          <Box
            sx={{
              flex: '1 1 auto', // Takes up remaining space
              overflow: 'hidden', // Ensures no overflow beyond viewport
            }}
          >
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/login-success" element={<MainPage />} />
              <Route path="/friends" element={<FriendOverview />} />
              <Route path="settings" element={<Settings />} />
              <Route path="/docs/*" element={<SwaggerDocs />} />
            </Routes>
          </Box>

          {/* Optional Error Display */}
          <InfoDisplay />
        </Box>
      </ThemeProvider>
    </Router>
  );
};

// const LoginSuccess: React.FC = () => {
//   React.useEffect(() => {
//     // You could add a redirect timer or other logic here
//   }, []);

//   return <div>Login Successful! Redirecting...</div>;
// };

export default App;
