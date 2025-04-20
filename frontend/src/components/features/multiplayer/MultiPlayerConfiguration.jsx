import React, { useState } from 'react';
import { 
  BookOpenIcon, 
  CodeIcon, 
  AwardIcon, 
  ClockIcon, 
  XIcon, 
  CheckIcon, 
  ArrowRightCircleIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';

const MultiPlayerConfiguration = ({ roomCode, onConfigurationComplete, onCancel }) => {
  // Default configuration state
  const [config, setConfig] = useState({
    type: 'paragraph', // paragraph or code
    level: 'intermediate', // beginner, intermediate, expert
    language: null, // null, javascript, python (only for code)
    genre: '', // depends on type and language
    testDuration: 60, // in seconds
  });
  
  // Error handling
  const [error, setError] = useState('');
  
  // Selected options highlighting
  const [highlights, setHighlights] = useState({
    type: 'paragraph',
    level: 'intermediate',
    language: null,
    testDuration: 60
  });
  
  // Available genres based on type and language
  const getAvailableGenres = () => {
    if (config.type === 'paragraph') {
      return ['general', 'technical', 'creative'];
    } else if (config.type === 'code' && config.language) {
      return ['algorithm', 'dataStructure', 'utility'];
    }
    return [];
  };
  
  // Helper to get genre descriptions
  const getGenreDescription = (genre) => {
    const descriptions = {
      // Paragraph genres
      general: 'Common topics and general knowledge',
      technical: 'Scientific and technical subject matter',
      creative: 'Creative writing and storytelling',
      
      // Code genres
      algorithm: 'Problem-solving algorithms',
      dataStructure: 'Efficient data organization',
      utility: 'Useful utility functions'
    };
    
    return descriptions[genre] || '';
  };
  
  // Handle type selection
  const handleTypeChange = (type) => {
    setHighlights({ ...highlights, type });
    
    if (type === 'paragraph') {
      setConfig({
        ...config,
        type,
        language: null,
        genre: ''
      });
    } else {
      setConfig({
        ...config,
        type,
        genre: ''
      });
    }
  };
  
  // Handle language selection (only for code type)
  const handleLanguageChange = (language) => {
    setHighlights({ ...highlights, language });
    setConfig({ ...config, language, genre: '' });
  };
  
  // Handle level selection
  const handleLevelChange = (level) => {
    setHighlights({ ...highlights, level });
    setConfig({ ...config, level });
  };
  
  // Handle genre selection
  const handleGenreChange = (genre) => {
    setConfig({ ...config, genre });
  };
  
  // Handle test duration selection
  const handleDurationChange = (duration) => {
    setHighlights({ ...highlights, testDuration: duration });
    setConfig({ ...config, testDuration: duration });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate configuration
    if (!config.genre) {
      setError('Please select a genre');
      return;
    }
    
    if (config.type === 'code' && !config.language) {
      setError('Please select a programming language');
      return;
    }
    
    // Clear any errors
    setError('');
    
    // Pass configuration to parent component
    onConfigurationComplete(config);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl bg-black/5 backdrop-blur-xl rounded-2xl shadow-lg border border-accent/70 overflow-hidden"
    >
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-accent/20 p-2 rounded-lg">
            <AwardIcon className="text-accent" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Game Configuration</h2>
            <p className="text-white/60">Room Code: {roomCode}</p>
          </div>
        </div>
        
        <button 
          onClick={onCancel}
          className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <XIcon size={24} />
        </button>
      </div>
      
      <div className="p-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
            {error}
          </div>
        )}
        
        {/* Type selection */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Content Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleTypeChange('paragraph')}
              className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                highlights.type === 'paragraph' 
                  ? 'bg-accent/20 border-accent' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className={`p-3 rounded-full ${
                highlights.type === 'paragraph' ? 'bg-accent/20' : 'bg-white/10'
              }`}>
                <BookOpenIcon className={highlights.type === 'paragraph' ? 'text-accent' : 'text-white/60'} size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Paragraph</div>
                <div className="text-white/60 text-sm">Text passages for general typing</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleTypeChange('code')}
              className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                highlights.type === 'code' 
                  ? 'bg-accent/20 border-accent' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className={`p-3 rounded-full ${
                highlights.type === 'code' ? 'bg-accent/20' : 'bg-white/10'
              }`}>
                <CodeIcon className={highlights.type === 'code' ? 'text-accent' : 'text-white/60'} size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Code</div>
                <div className="text-white/60 text-sm">Programming syntax for coders</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Language selection (only for code type) */}
        {config.type === 'code' && (
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4">Programming Language</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleLanguageChange('javascript')}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  highlights.language === 'javascript' 
                    ? 'bg-accent/20 border-accent' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-white">JavaScript</div>
                </div>
                {highlights.language === 'javascript' && (
                  <CheckIcon className="text-accent ml-auto" size={20} />
                )}
              </button>
              
              <button 
                onClick={() => handleLanguageChange('python')}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  highlights.language === 'python' 
                    ? 'bg-accent/20 border-accent' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-white">Python</div>
                </div>
                {highlights.language === 'python' && (
                  <CheckIcon className="text-accent ml-auto" size={20} />
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Difficulty selection */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Difficulty Level</h3>
          <div className="grid grid-cols-3 gap-4">
            {['beginner', 'intermediate', 'expert'].map((level) => (
              <button 
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`p-4 rounded-xl border capitalize transition-all ${
                  highlights.level === level
                    ? 'bg-accent/20 border-accent' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-white">{level}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Genre selection */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Content Genre</h3>
          <div className="grid grid-cols-3 gap-4">
            {getAvailableGenres().map((genre) => (
              <button 
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`p-4 rounded-xl border transition-all ${
                  config.genre === genre
                    ? 'bg-accent/20 border-accent' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-white capitalize">{genre}</div>
                <div className="text-white/60 text-sm mt-1">{getGenreDescription(genre)}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Duration selection */}
        <div className="mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Test Duration</h3>
          <div className="flex items-center gap-4 flex-wrap">
            {[30, 60, 120, 180, 300].map((seconds) => (
              <button 
                key={seconds}
                onClick={() => handleDurationChange(seconds)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  highlights.testDuration === seconds
                    ? 'bg-accent/20 border-accent' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <ClockIcon className={highlights.testDuration === seconds ? 'text-accent' : 'text-white/60'} size={16} />
                <span className="text-white">{seconds < 60 ? `${seconds}s` : `${seconds/60}m`}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 px-6 py-3 rounded-lg transition-all"
          >
            <span className="text-white font-bold">Create Game</span>
            <ArrowRightCircleIcon className="text-white" size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MultiPlayerConfiguration;