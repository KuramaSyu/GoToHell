import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DiscordLogin from './components/DiscordLogin';
import './styles/DiscordLogin.css';
import './App.css';
import HomePage from './components/HomePage';
import { CssBaseline } from '@mui/material';

// Import other components as needed

const App: React.FC = () => {
	return (
		<Router>
			<CssBaseline />
			<div className="app">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/login-success" element={<HomePage />} />
					{/* Add other routes as needed */}
				</Routes>
			</div>
		</Router>
	);
};

const LoginSuccess: React.FC = () => {
	React.useEffect(() => {
		// You could add a redirect timer or other logic here
	}, []);

	return <div>Login Successful! Redirecting...</div>;
};

export default App;
