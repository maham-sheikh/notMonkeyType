import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { AppConfigProvider } from "./context/AppConfig";
import { NavigationProvider } from './context/NavigationContext';

// Pages and components
import Login from './pages/Login';
import Home from './pages/Home.jsx';
import SinglePlayer from './pages/SinglePlayer';
import MultiPlayer from './pages/MultiPlayer';
import HeroPage from './pages/HeroPage';
import NoPage from './components/common/NoPage';
import Background from './components/common/Background.jsx';

// Protected routes wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <AppConfigProvider>
    <AuthProvider>
      <GameProvider>
        <div className="App min-h-screen bg-black/80 font-Publica">
          <Background />
          <Router>
          <NavigationProvider>

            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HeroPage />} />
              <Route path="/hero" element={<HeroPage />} />
              <Route path="/login" element={<HeroPage />} />
              <Route path="/register" element={<HeroPage />} />
              
              {/* Protected routes */}
              <Route path="/home/*" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              
              <Route path="/single-player" element={
                <ProtectedRoute>
                  <SinglePlayer />
                </ProtectedRoute>
              } />
              
              <Route path="/multi-player" element={
                <ProtectedRoute>
                  <MultiPlayer />
                </ProtectedRoute>
              } />
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<NoPage />} />
            </Routes>
            </NavigationProvider>

          </Router>
        </div>
      </GameProvider>
    </AuthProvider>
    </AppConfigProvider>


  );
};

export default App;