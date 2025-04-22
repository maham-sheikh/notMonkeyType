// src/pages/SinglePlayer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Keyboard from '../components/common/Keyboard';
import NavigationBar from '../components/layouts/Navbar';
import ScoreCard from '../components/common/ScoreCard';
import GameConfiguration from '../components/features/typing/GameConfiguration';
import TestArea from '../components/features/typing/TestArea';
import StatsDisplay from '../components/features/typing/StatsDisplay';
import GameInfo from '../components/features/typing/GameInfo.jsx';
import { saveGameResult } from '../services/gameSessionService';

const SinglePlayer = () => {
  // Game configuration state
  const [isConfiguring, setIsConfiguring] = useState(true);
  
  // Game state
  const [testText, setTestText] = useState("The quick brown fox jumps over the lazy dog.");
  const [userInput, setUserInput] = useState("");
  const [charClasses, setCharClasses] = useState(Array(testText.length).fill("default"));
  const [testStarted, setTestStarted] = useState(false);
  const [testDuration, setTestDuration] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [wpm, setWpm] = useState('-');
  const [accuracy, setAccuracy] = useState('-');
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [gameConfig, setGameConfig] = useState({
    type: 'paragraph',
    difficultyLevel: 'intermediate',
    testDuration: 60
  });
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Helper functions
  const calculateWPM = (typedChars, duration) => {
    const wordsTyped = typedChars / 5;
    const minutes = duration / 60;
    return (wordsTyped / minutes).toFixed(2);
  };

  const calculateAccuracy = (correctChars, typedChars) => {
    return typedChars > 0 ? ((correctChars / typedChars) * 100).toFixed(2) : "100.00";
  };

  // Direct key event handler (bypassing React's input handling)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!testStarted) return;
      
      // Handle backspace
      if (e.key === 'Backspace' && currentIndex > 0) {
        e.preventDefault(); // Prevent browser back navigation
        const newCharClasses = [...charClasses];
        newCharClasses[currentIndex - 1] = 'default';
        
        setCurrentIndex(prevIndex => prevIndex - 1);
        setCharClasses(newCharClasses);
        setUserInput(prevInput => prevInput.slice(0, -1));
        
        // Update stats
        const typedChars = userInput.length - 1;
        const correctChars = newCharClasses.filter(c => c === 'correct').length;
        
        if (typedChars > 0) {
          setWpm(calculateWPM(typedChars, testDuration));
          setAccuracy(calculateAccuracy(correctChars, typedChars));
        }
        return;
      }
      
      // Ignore keys that don't produce characters or modifier keys
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Normal typing
      if (currentIndex < testText.length) {
        const newCharClasses = [...charClasses];
        const newInput = userInput + e.key;
        
        if (e.key === testText[currentIndex]) {
          newCharClasses[currentIndex] = 'correct';
        } else {
          newCharClasses[currentIndex] = 'wrong';
        }
        
        setCurrentIndex(prevIndex => prevIndex + 1);
        setCharClasses(newCharClasses);
        setUserInput(newInput);
        
        // Update stats
        const typedChars = newInput.length;
        const correctChars = newCharClasses.filter(c => c === 'correct').length;
        
        if (typedChars > 0) {
          setWpm(calculateWPM(typedChars, testDuration));
          setAccuracy(calculateAccuracy(correctChars, typedChars));
        }
      }
    };
    
    if (testStarted) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [testStarted, currentIndex, charClasses, testText, userInput, testDuration]);

  // Start test
  const startTest = () => {
    // Reset the game state
    setUserInput("");
    setWpm('-');
    setAccuracy('-');
    setCurrentIndex(0);
    setCharClasses(Array(testText.length).fill("default"));
    setShowScoreCard(false);
    
    // Start the timer
    setTimeRemaining(testDuration);
    
    // Start the test
    setTestStarted(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Start a new timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Focus the input element
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // End test
  const endTest = async () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTestStarted(false);
    
    const typedChars = userInput.length;
    const correctChars = charClasses.filter(c => c === 'correct').length;
    
    const newWPM = calculateWPM(typedChars, testDuration);
    const newAccuracy = calculateAccuracy(correctChars, typedChars);
    const newScore = Math.round((parseFloat(newWPM) * 0.4) + (parseFloat(newAccuracy) * 0.6));
    
    setWpm(newWPM);
    setAccuracy(newAccuracy);
    setScore(newScore);
    setShowScoreCard(true);
    
    // Save game session
    try {
      console.log("saving", testText, newScore, newWPM, newAccuracy, testDuration);

      const response = await saveGameResult({
        textUsed: testText,
        score: newScore,
        wpm: newWPM,
        accuracy: newAccuracy,
        sessionTime: testDuration
      });

      console.log("Game session saved successfully:", response);
    } catch (error) {
      console.error('Error saving game session:', error);
      // Optionally show an error message to the user
    }
  };

  // Handle configuration
  const handleConfigurationComplete = (config) => {
    console.log("Configuration complete:", config);
    
    // Ensure we have the test text
    if (!config.testText) {
      console.error("No test text provided in configuration");
      return;
    }
    
    // Set up game based on configuration
    setTestText(config.testText);
    setTestDuration(config.testDuration || 60);
    setTimeRemaining(config.testDuration || 60);
    setCharClasses(Array(config.testText.length).fill("default"));
    setGameConfig(config);
    setIsConfiguring(false);
    
    // Automatically start the test after configuration is complete
    setTimeout(() => {
      startTest();
    }, 500);
  };

  // Watch for timer reaching zero
  useEffect(() => {
    if (timeRemaining === 0 && testStarted) {
      endTest();
    }
  }, [timeRemaining, testStarted]);

  // Test completion effect
  useEffect(() => {
    if (userInput.length === testText.length && testStarted && userInput.length > 0) {
      endTest();
    }
  }, [userInput, testText, testStarted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/40 to-accent/20 relative overflow-hidden">
      {/* Navigation */}
      <NavigationBar 
        mode="SinglePlayer"
        onStartTest={startTest}
        onEndTest={endTest}
        testStarted={testStarted}
        onReconfigure={() => setIsConfiguring(true)}
      />

      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-24 pb-0 relative z-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-4">
          {/* Test Area and Keyboard Container */}
          <div className="space-y-4">
            {/* Test Area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
            >
              <TestArea 
                testText={testText}
                charClasses={charClasses}
                currentIndex={currentIndex}
              />
              {/* Hidden input for focus management */}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                readOnly
                className="opacity-0 absolute left-[-9999px]"
                autoFocus
                tabIndex={-1}
              />
            </motion.div>
            
            {/* Keyboard */}
            <div className="w-full flex justify-center">
              <Keyboard />
            </div>
          </div>
          
          {/* Stats Display and Game Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Game Configuration Info */}
            <GameInfo config={gameConfig} />
            
            {/* Stats Display */}
            <StatsDisplay 
              wpm={wpm}
              accuracy={accuracy}
              timeRemaining={timeRemaining}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Configuration Overlay */}
      <AnimatePresence>
        {isConfiguring && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <GameConfiguration 
                onConfigurationComplete={handleConfigurationComplete}
                initialConfig={gameConfig}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Card */}
      <AnimatePresence>
        {showScoreCard && (
          <ScoreCard
            wpm={wpm}
            time={testDuration}
            accuracy={accuracy}
            score={score}
            onClose={() => setShowScoreCard(false)}
            onReconfigure={() => setIsConfiguring(true)}
          />
        )}
      </AnimatePresence>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default SinglePlayer;