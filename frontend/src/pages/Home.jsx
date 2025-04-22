import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout components
import NavigationBar from '../components/layouts/NavigationBar';
import Footer from '../components/layouts/Footer';
import Background from '../components/layouts/Background';

// Page components
import GameMenu from '../components/features/game/GameMenu';
import Leaderboards from '../components/features/leaderboard/Leaderboards';
import Friends from '../components/features/social/Friends';
import Scores from '../components/features/profile/Scores';
import Settings from '../components/features/settings/Settings';
import Profile from '../components/features/profile/Profile';
import NoPage from '../components/common/NoPage';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      {/* Background extends to cover the entire viewport and content */}
      <div className="fixed inset-0 z-0">
        <Background />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavigationBar userName={user?.name || user?.email} />

        <main className="flex-grow container mx-auto py-8 flex justify-center items-center">
          <div className="w-full min-h-[500px] max-w-6xl">
            <Routes>
              <Route index element={<GameMenu />} />
              <Route path="gamemenu" element={<GameMenu />} />
              <Route path="leaderboards" element={<Leaderboards />} />
              <Route path="friends" element={<Friends />} />
              <Route path="scores" element={<Scores />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </div>
        </main>

        <Footer />
        
        <div className="h-16"></div>
      </div>
    </div>
  );
};

export default Home;