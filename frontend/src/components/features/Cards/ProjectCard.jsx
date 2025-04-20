import React from 'react';
import { FaReact, FaNodeJs, FaDatabase, FaAtom, FaCube, FaVuejs, FaJs, FaPython, FaGithub } from 'react-icons/fa';
import { SiTailwindcss, SiMongodb, SiExpress, SiFirebase, SiTypescript } from 'react-icons/si';
import { motion } from 'framer-motion';

const ProjectCard = ({ name, technologiesUsed, detail, githubLink }) => {
  // Map of technology names to their corresponding icons
  const technologyIcons = {
    'react': <FaReact className="text-blue-400" />,
    'nodejs': <FaNodeJs className="text-green-500" />,
    'node.js': <FaNodeJs className="text-green-500" />,
    'mongodb': <SiMongodb className="text-green-600" />,
    'mongo': <SiMongodb className="text-green-600" />,
    'spline': <FaAtom className="text-purple-400" />,
    'tailwind': <SiTailwindcss className="text-blue-500" />,
    'tailwindcss': <SiTailwindcss className="text-blue-500" />,
    'vue': <FaVuejs className="text-green-500" />,
    'vuejs': <FaVuejs className="text-green-500" />,
    'express': <SiExpress className="text-gray-100" />,
    'firebase': <SiFirebase className="text-yellow-500" />,
    'javascript': <FaJs className="text-yellow-400" />,
    'js': <FaJs className="text-yellow-400" />,
    'typescript': <SiTypescript className="text-blue-600" />,
    'ts': <SiTypescript className="text-blue-600" />,
    'python': <FaPython className="text-blue-500" />
  };

  // Get icon for a technology
  const getIcon = (technology) => {
    const tech = technology.toLowerCase().trim();
    return technologyIcons[tech] || <FaCube className="text-gray-300" />;
  };

  // Animation variants
  const cardVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className="p-6">
        <h2 className="text-3xl font-bold text-white mb-4">{name}</h2>
        
        {/* Project description */}
        <p className="text-lg text-white mb-6">{detail}</p>
        
        {/* Technologies */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">Technologies</h3>
          <div className="flex flex-wrap gap-3">
            {technologiesUsed.split(',').map(tech => (
              <span 
                key={tech} 
                className="flex items-center bg-indigo-800 bg-opacity-60 text-white px-3 py-1 rounded-full"
              >
                <span className="mr-1.5 text-xl">{getIcon(tech.trim())}</span>
                <span>{tech.trim()}</span>
              </span>
            ))}
          </div>
        </div>
        
        {/* GitHub link */}
        <div className="mt-auto flex justify-center">
          <motion.a 
            href={githubLink} 
            target="_blank" 
            rel="noopener noreferrer"
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <button className="flex items-center bg-gray-900 hover:bg-black text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <FaGithub className="mr-2 text-xl" />
              View on GitHub
            </button>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;