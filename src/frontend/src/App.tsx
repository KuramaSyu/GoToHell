import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/DiscordLogin.css';
import '@mui/material/styles';
//import './App.css';
import HomePage from './components/HomePage';
import FriendOverview from '../pages/friends/FriendOverview';
import TopBar from './components/TopBar';
import {CssBaseline, ThemeProvider} from "@mui/material"
import { useThemeStore } from './zustand/useThemeStore';
// Import other components as needed

const App: React.FC = () => {
  const {theme} = useThemeStore();
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <TopBar></TopBar>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login-success" element={<HomePage />} />
          <Route path="/friends" element={<FriendOverview />}/>
          {/* Add other routes as needed */}
        </Routes>

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
