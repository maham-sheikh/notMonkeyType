// src/components/features/typing/GameConfiguration.jsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  FileText, Terminal, Shield, Zap, Crosshair, X, Loader, ArrowRightCircle
} from 'lucide-react';
import ContentService from '../../../services/ContentService';
import { 
  OptionButton, OptionCard, SectionHeader, AnimatedContainer, ErrorDisplay, ActionButton
} from './../../common/ConfigUI';

const GameConfiguration = ({ onConfigurationComplete, initialConfig = {}, onCancel }) => {
  // State management
  const [config, setConfig] = useState({
    type: 'paragraph', difficultyLevel: 'intermediate', testDuration: 60,
    genre: '', language: null, ...initialConfig
  });
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Options configuration
  const testModes = [
    { value: 'paragraph', icon: <FileText />, label: 'Paragraph', description: 'Text passages' },
    { value: 'code', icon: <Terminal />, label: 'Code', description: 'Programming syntax' }
  ];
  
  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', icon: <Shield />, color: 'text-green-400' },
    { value: 'intermediate', label: 'Intermediate', icon: <Zap />, color: 'text-yellow-400' },
    { value: 'expert', label: 'Expert', icon: <Crosshair />, color: 'text-red-400' }
  ];
  
  const durationOptions = [
    { value: 30, label: '30s' }, { value: 60, label: '1m' }, 
    { value: 90, label: '1m 30s' }, { value: 120, label: '2m' }, 
    { value: 180, label: '3m' }
  ];

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' }, { value: 'python', label: 'Python' }
  ];

  // Genre descriptions
  const genreDescriptions = {
    'general': 'Common topics', 'technical': 'Technical subject matter',
    'creative': 'Creative writing', 'news': 'Current events',
    'algorithm': 'Problem-solving', 'dataStructure': 'Data organization',
    'utility': 'Utility functions', 'webDev': 'Web development'
  };

  // Fetch genres based on type/language
  useEffect(() => {
    const fetchGenres = async () => {
      if (!(config.type && (config.type !== 'code' || config.language))) return;
      
      setIsLoading(true);
      try {
        const fetchParams = {
          type: config.type,
          ...(config.type === 'code' && config.language ? { language: config.language } : {})
        };
        
        const fetchedGenres = await ContentService.getGenres(fetchParams.type, fetchParams.language);
        const safeGenres = Array.isArray(fetchedGenres) ? fetchedGenres : [];
        
        setGenres(safeGenres);
        
        // Auto-select first genre if needed
        if (safeGenres.length > 0 && !config.genre) {
          setConfig(prev => ({ ...prev, genre: safeGenres[0] }));
        } else if (config.genre && !safeGenres.includes(config.genre)) {
          setConfig(prev => ({ ...prev, genre: safeGenres.length > 0 ? safeGenres[0] : '' }));
        }
      } catch (err) {
        setError('Failed to fetch genres');
        setGenres([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, [config.type, config.language]);

  // Update configuration
  const updateConfig = (key, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      if (key === 'type' || key === 'language') {
        newConfig.genre = '';
        if (key === 'type' && value === 'code' && !prev.language) {
          newConfig.language = 'javascript';
        }
      }
      return newConfig;
    });
  };

  // Handle configuration submission
  const handleSubmit = async () => {
    if (!config.genre) {
      setError('Please select a genre');
      return;
    }

    setIsLoading(true);
    try {
      const contentResponse = await ContentService.generateContent(config);
      onConfigurationComplete({...config, testText: contentResponse.content});
    } catch (err) {
      setError('Failed to generate content');
      setIsLoading(false);
    }
  };

  return (
    <AnimatedContainer className="max-h-[95vh] overflow-y-auto p-4 w-full max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-white">Game Configuration</h2>
        {onCancel && (
          <button onClick={onCancel} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>
      
      <AnimatePresence>{error && <ErrorDisplay error={error} />}</AnimatePresence>
      
      {/* Content Type */}
      <div className="mb-3">
        <SectionHeader title="Type" className="mb-1" />
        <div className="grid grid-cols-2 gap-2">
          {testModes.map((mode) => (
            <OptionCard
              key={mode.value}
              selected={config.type === mode.value}
              onClick={() => updateConfig('type', mode.value)}
              icon={mode.icon}
              title={mode.label}
              description={mode.description}
              className="py-2 px-3"
            />
          ))}
        </div>
      </div>

      {/* Code Language */}
      <AnimatePresence>
        {config.type === 'code' && (
          <div className="mb-3">
            <SectionHeader title="Language" className="mb-1" />
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((lang) => (
                <OptionButton
                  key={lang.value}
                  selected={config.language === lang.value}
                  onClick={() => updateConfig('language', lang.value)}
                  className="flex-1 justify-center py-2"
                >
                  {lang.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Difficulty Level */}
      <div className="mb-3">
        <SectionHeader title="Difficulty" className="mb-1" />
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((option) => (
            <OptionButton
              key={option.value}
              selected={config.difficultyLevel === option.value}
              onClick={() => updateConfig('difficultyLevel', option.value)}
              className={`justify-center py-2 ${config.difficultyLevel === option.value ? option.color : ''}`}
              icon={option.icon}
              iconPosition="left"
              size="sm"
            >
              {option.label}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-3">
        <SectionHeader title="Duration" className="mb-1" />
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => (
            <OptionButton
              key={option.value}
              selected={config.testDuration === option.value}
              onClick={() => updateConfig('testDuration', option.value)}
              className="justify-center py-1 px-3"
              size="sm"
            >
              {option.label}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Genre Selection */}
      <div className="mb-3">
        <SectionHeader title="Genre" className="mb-1" />
        {isLoading ? (
          <div className="flex items-center justify-center p-3 text-white/60 text-sm">
            <Loader className="animate-spin mr-2" size={16} />
            <span>Loading...</span>
          </div>
        ) : genres.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-2 text-center text-white/60 text-sm">
            No genres available
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {genres.map((genre) => (
              <OptionButton
                key={genre}
                selected={config.genre === genre}
                onClick={() => updateConfig('genre', genre)}
                className="flex flex-col items-center text-center py-2"
                size="sm"
              >
                <div className="font-medium capitalize text-sm">{genre}</div>
                <div className="text-xs mt-0.5 opacity-80">
                  {genreDescriptions[genre] || 'Typing practice'}
                </div>
              </OptionButton>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <ActionButton
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!config.genre}
          icon={<ArrowRightCircle size={16} />}
          variant="primary"
          className="py-2 px-4 text-sm"
        >
          Start Game
        </ActionButton>
      </div>
    </AnimatedContainer>
  );
};

export default GameConfiguration;