import React from 'react';
import { 
  AwardIcon, XIcon, BookOpenIcon, CodeIcon, ClockIcon, ArrowRightCircleIcon 
} from 'lucide-react';
import { 
  OptionButton, OptionCard, SectionHeader, ErrorDisplay, ActionButton 
} from '../../common/ConfigUI';
import SocketService from '../../../services/SocketService';

const ConfigurationForm = ({ 
  config, 
  setConfig, 
  formState, 
  updateFormState, 
  setRoomCode,
  parentLoading 
}) => {
  // Utility functions
  const getAvailableGenres = () => {
    return config.type === 'paragraph' 
      ? ['general', 'technical', 'creative']
      : (config.type === 'code' && config.language) 
        ? ['algorithm', 'dataStructure', 'utility'] 
        : [];
  };
  
  const getGenreDescription = (genre) => {
    const descriptions = {
      general: 'Common topics and general knowledge',
      technical: 'Scientific and technical subject matter',
      creative: 'Creative writing and storytelling',
      algorithm: 'Problem-solving algorithms',
      dataStructure: 'Efficient data organization',
      utility: 'Useful utility functions'
    };
    
    return descriptions[genre] || '';
  };

  const handleTypeChange = (type) => {
    setConfig({
      ...config,
      type,
      language: type === 'paragraph' ? null : config.language,
      genre: type === 'paragraph' ? 'general' : ''
    });
  };

  const handleConfigurationSubmit = () => {
    if (!config.genre) {
      updateFormState({ error: 'Please select a genre' });
      return;
    }
    
    if (config.type === 'code' && !config.language) {
      updateFormState({ error: 'Please select a programming language' });
      return;
    }
    
    if (!SocketService.isConnected()) {
      SocketService.reconnect();
    }
    
    SocketService.emitRoomConfiguration({
      roomCode: formState.generatedCode,
      ...config
    });
    
    setRoomCode(formState.generatedCode);
  };

  return (
    <>
      {/* Configuration Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-accent/20 p-2 rounded-lg">
            <AwardIcon className="text-accent" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Game Configuration</h2>
            <p className="text-white/60">Room Code: {formState.generatedCode}</p>
          </div>
        </div>
        
        <button 
          onClick={() => updateFormState({ showConfiguration: false, generatedCode: '' })}
          className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <XIcon size={20} />
        </button>
      </div>
      
      <ErrorDisplay error={formState.error} />
      
      {/* Content Type */}
      <div className="mb-6">
        <SectionHeader title="Content Type" />
        <div className="grid grid-cols-2 gap-4">
          <OptionCard
            selected={config.type === 'paragraph'}
            onClick={() => handleTypeChange('paragraph')}
            icon={<BookOpenIcon />}
            title="Paragraph"
            description="Text passages"
          />
          
          <OptionCard
            selected={config.type === 'code'}
            onClick={() => handleTypeChange('code')}
            icon={<CodeIcon />}
            title="Code"
            description="Programming syntax"
          />
        </div>
      </div>
      
      {/* Language Selection (only for code) */}
      {config.type === 'code' && (
        <div className="mb-6">
          <SectionHeader title="Programming Language" />
          <div className="grid grid-cols-2 gap-4">
            {['javascript', 'python'].map((lang) => (
              <OptionButton
                key={lang}
                selected={config.language === lang}
                onClick={() => setConfig({...config, language: lang})}
                className="capitalize"
              >
                {lang}
              </OptionButton>
            ))}
          </div>
        </div>
      )}
      
      {/* Difficulty Level */}
      <div className="mb-6">
        <SectionHeader title="Difficulty Level" />
        <div className="grid grid-cols-3 gap-4">
          {['beginner', 'intermediate', 'expert'].map((level) => (
            <OptionButton
              key={level}
              selected={config.level === level}
              onClick={() => setConfig({...config, level})}
              className="capitalize"
            >
              {level}
            </OptionButton>
          ))}
        </div>
      </div>
      
      {/* Content Genre */}
      <div className="mb-6">
        <SectionHeader title="Content Genre" />
        <div className="grid grid-cols-3 gap-4">
          {getAvailableGenres().map((genre) => (
            <OptionButton
              key={genre}
              selected={config.genre === genre}
              onClick={() => setConfig({...config, genre})}
              className="flex flex-col items-start h-auto"
            >
              <span className="font-bold capitalize">{genre}</span>
              <span className="text-white/60 text-xs mt-1">{getGenreDescription(genre)}</span>
            </OptionButton>
          ))}
        </div>
      </div>
      
      {/* Test Duration */}
      <div className="mb-6">
        <SectionHeader title="Test Duration" />
        <div className="flex items-center gap-3 flex-wrap">
          {[30, 60, 120, 180, 300].map((seconds) => (
            <OptionButton
              key={seconds}
              selected={config.testDuration === seconds}
              onClick={() => setConfig({...config, testDuration: seconds})}
              icon={<ClockIcon size={14} />}
              size="sm"
            >
              {seconds < 60 ? `${seconds}s` : `${seconds/60}m`}
            </OptionButton>
          ))}
        </div>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end mt-auto">
        <ActionButton
          onClick={handleConfigurationSubmit}
          disabled={formState.loading || parentLoading}
          icon={<ArrowRightCircleIcon size={20} />}
        >
          Create Game
        </ActionButton>
      </div>
    </>
  );
};

export default ConfigurationForm;