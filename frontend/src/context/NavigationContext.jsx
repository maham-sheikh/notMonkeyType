import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAppConfig } from './AppConfig';

// Lucide Icons
import { Gamepad2, Trophy, Users, ListOrdered, User, Info, LogOut } from 'lucide-react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { logo } = useAppConfig();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (paths) => paths.some((path) => location.pathname.toLowerCase() === path.toLowerCase());

  const navLinks = [
    { to: "/Home/GameMenu", icon: <Gamepad2 size={20} />, text: "Game Menu", paths: ['/Home/gamemenu', '/Home'] },
    { to: "/Home/Leaderboards", icon: <Trophy size={20} />, text: "Leaderboard", paths: ['/Home/Leaderboards'] },
    { to: "/Home/Friends", icon: <Users size={20} />, text: "Friends", paths: ['/Home/Friends'] },
    { to: "/Home/Scores", icon: <ListOrdered size={20} />, text: "Scores", paths: ['/Home/Scores'] },
    { to: "/Home/Profile", icon: <User size={20} />, text: "Profile", paths: ['/Home/Profile'] },
    // { to: "/Home/About", icon: <Info size={20} />, text: "About", paths: ['/Home/about'] },
  ];

  return (
    <NavigationContext.Provider value={{ logo, user, handleLogout, navLinks, isActive, scrolled }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
