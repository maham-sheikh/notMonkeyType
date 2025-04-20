import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';


const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logo, user, handleLogout, navLinks, isActive, scrolled } = useNavigation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`bg-white/5 backdrop-blur-xl lg:rounded-xl lg:mt-8 lg:mx-12 z-30 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/Home/GameMenu" onClick={closeMenu}>
              <img className="h-10 w-auto lg:h-16" src={logo} alt="App Logo" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-white p-2 rounded-xl focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:ml-6 items-center space-x-3">
            {navLinks.map(({ to, icon, text, paths }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMenu}
                className={`flex items-center px-4 py-2 rounded-xl text-white font-medium transition duration-200 ${
                  isActive(paths) ? 'bg-accent' : 'hover:bg-accent/40'
                }`}
              >
                {icon} <span className="ml-2">{text}</span>
              </Link>
            ))}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-white font-medium transition duration-200 rounded-xl hover:bg-accentHover"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          {navLinks.map(({ to, icon, text, paths }) => (
            <Link
              key={to}
              to={to}
              onClick={closeMenu}
              className={`flex items-center px-4 py-2 text-white rounded-xl transition duration-200 ${
                isActive(paths) ? 'bg-accent' : 'hover:bg-accent/40'
              }`}
            >
              {icon} <span className="ml-2">{text}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-white text-left rounded-xl transition duration-200 hover:bg-accent/10"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
