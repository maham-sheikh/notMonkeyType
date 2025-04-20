import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaDribbble } from 'react-icons/fa';
import LetterGlitch from './LetterGlitch';
import { useAppConfig } from '../../context/AppConfig';

const Footer = () => {
  const { logo, contact, socialMediaLinks } = useAppConfig();

  // Social media links dynamically from context
  const socialLinks = socialMediaLinks.map(({ href, icon: Icon }, index) => ({
    icon: <Icon />,
    label: href.split('.')[1], // Extract domain for label (e.g., facebook, twitter)
    url: href,
  }));

  // Footer links array for cleaner rendering
  const companyLinks = [
    { label: 'About', url: '#' },
    { label: 'Meet the Team', url: '#' },
    { label: 'Accounts Review', url: '#' }
  ];

  // Legal links array
  const legalLinks = [
    { label: 'Terms & Conditions', url: '#' },
    { label: 'Privacy Policy', url: '#' },
    { label: 'Cookies', url: '#' }
  ];

  return (
    <footer className="bg-white/5 backdrop-blur-xl mx-12 max-w-screen-2xl rounded-xl lg:grid lg:grid-cols-5   shadow-lg overflow-hidden">
      {/* Image Section */}
      <div className="relative block h-72 lg:h-full lg:col-span-2">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
      </div>

      {/* Content Section */}
      <div className="px-6 py-10 sm:px-8 lg:col-span-3 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Contact Information */}
          <div className="transition-transform duration-300">
            <div className="mb-6 rounded-full">
              <img src={logo} alt="notMonkeyType" className="h-auto w-40 object-cover" />
            </div>

            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <a href={`mailto:${contact.email}`} className="text-white hover:text-accentHover font-medium text-lg transition duration-300">
              {contact.email}
            </a>

            {/* Social Media Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  rel="noreferrer"
                  target="_blank"
                  className="text-white p-2 rounded-full bg-white/10 hover:bg-accentHover transition duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="transition-transform duration-300">
              <h3 className="text-xl font-bold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} className="text-white/80 hover:text-accent transition duration-300">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div> */}


        </div>

        {/* Footer Bottom */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            {/* Legal Links */}
            <ul className="flex flex-wrap gap-6 text-xs">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.url} className="text-white/70 hover:text-accent transition duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Copyright */}
            <p className="mt-6 text-sm text-white/70 sm:mt-0">
              &copy; {new Date().getFullYear()} SS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
