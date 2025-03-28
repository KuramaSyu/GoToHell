import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/DiscordLogin.css';
import '@mui/material/styles';
//import './App.css';
import HomePage from './components/HomePage';
import FriendOverview from './pages/friends/IdDisplay';
import TopBar from './components/TopBar';
import { Box, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import { useThemeStore } from './zustand/useThemeStore';
import ErrorDisplay from './components/ErrorDisplay';
import { Settings } from './pages/Settings/Settings';
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
              <Route path="/" element={<HomePage />} />
              <Route path="/login-success" element={<HomePage />} />
              <Route path="/friends" element={<FriendOverview />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </Box>

          {/* Optional Error Display */}
          <ErrorDisplay />
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
