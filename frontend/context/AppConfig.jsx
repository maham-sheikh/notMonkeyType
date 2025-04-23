import { createContext, useContext } from "react";
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaDribbble } from 'react-icons/fa';

import Logo from '../assets/app_material/logo.png';



const AppConfigContext = createContext();

export const AppConfigProvider = ({ children }) => {
  const appConfig = {
    appName: "notMonkeytype",
    logo: Logo,
    defaultUser: null,
    nameLogo:Logo,
    address: "Fast Nuces, Lahore",
    contact: {
      email: "notmonkeytype@gmail.com",
      // phone: "+123456789",
    },
    socialMediaLinks: [
      // { href: 'https://facebook.com', icon: Facebook },
      // { href: 'https://twitter.com', icon: Twitter },
      // { href: 'https://instagram.com', icon: Instagram },
      { href: 'https://github.com', icon: FaGithub },

    ],
  };

  return (
    <AppConfigContext.Provider value={appConfig}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);