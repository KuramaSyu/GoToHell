import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DiscordLogin from './components/DiscordLogin';
import './styles/DiscordLogin.css';
import './App.css';
import HomePage from './components/HomePage';

// Import other components as needed

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header>
          <h1>Go To Hell</h1>
        </header>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

const LoginSuccess: React.FC = () => {
  React.useEffect(() => {
    // You could add a redirect timer or other logic here
  }, []);
  
  return <div>Login Successful! Redirecting...</div>;
};

export default App;
