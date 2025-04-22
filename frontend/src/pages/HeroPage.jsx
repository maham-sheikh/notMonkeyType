import React, { useState } from 'react';
import Hero from '../components/common/Hero';
import Footer from '../components/layouts/Footer';
import { useNavigation } from './../context/NavigationContext';
import { Gamepad, Trophy } from 'lucide-react';

import AuthPortal from './AuthPortal';


function HeroPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { logo } = useNavigation();

  const openLoginModal = () => {
    setActiveTab('login');
    setShowModal(true);
  };

  const openRegisterModal = () => {
    setActiveTab('signup');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <div className="absolute flex justify-center w-full top-0 z-10">
        <div className="w-2/4 mt-60 bg-transparent backdrop-filter text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center ml-40 px-10 mt-20">
              <button
                onClick={openLoginModal}
                className="text-white block px-8 py-2 rounded-md text-base font-medium bg-gradient-to-r from-accent/40 to-accent mr-4 transition duration-300 ease-in-out hover:opacity-80"
              >
                <Gamepad className="inline-block mr-2" size={18} />
                Login
              </button>
              <button
                onClick={openRegisterModal}
                className="text-white block px-8 py-2 rounded-md text-base font-medium bg-gradient-to-r from-accent/40 to-accent transition duration-300 ease-in-out hover:opacity-80"
              >
                <Trophy className="inline-block mr-2" size={18} />
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
      <Hero />

      {/* Auth Modal */}
      {showModal && (
        <AuthPortal 
          logo={logo}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default HeroPage;