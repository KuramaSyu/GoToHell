import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/DiscordLogin.css';
import '@mui/material/styles';
//import './App.css';
import HomePage from './components/HomePage';
import FriendOverview from './components/friendOverview';
import TopBar from './components/TopBar';

// Import other components as needed

const App: React.FC = () => {
  return (
    <Router>
      <TopBar></TopBar>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login-success" element={<HomePage />} />
        <Route path="/friends" element={<FriendOverview />}/>
        {/* Add other routes as needed */}
      </Routes>
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
