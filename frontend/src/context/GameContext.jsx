import React, { createContext, useContext, useReducer, useEffect } from 'react';
import GenreDescription from '../utils/ParagraphGenerator';

// Initial state
const initialState = {
  testText: '',
  userInput: '',
  charClasses: [],
  testStarted: false,
  testDuration: 60,
  timeRemaining: 60,
  wpm: '-',
  accuracy: '-',
  score: 0,
  currentIndex: 0,
  difficultyLevel: 'intermediate',
  testType: 'paragraph',
  genre: '',
  language: null,
  showScoreCard: false,
};

// Action types
const ACTIONS = {
  SET_TEST_TEXT: 'SET_TEST_TEXT',
  SET_USER_INPUT: 'SET_USER_INPUT',
  SET_CHAR_CLASSES: 'SET_CHAR_CLASSES',
  SET_TEST_STARTED: 'SET_TEST_STARTED',
  SET_TEST_DURATION: 'SET_TEST_DURATION',
  SET_TIME_REMAINING: 'SET_TIME_REMAINING',
  SET_WPM: 'SET_WPM',
  SET_ACCURACY: 'SET_ACCURACY',
  SET_SCORE: 'SET_SCORE', 
  SET_CURRENT_INDEX: 'SET_CURRENT_INDEX',
  SET_DIFFICULTY_LEVEL: 'SET_DIFFICULTY_LEVEL',
  SET_TEST_TYPE: 'SET_TEST_TYPE',
  SET_GENRE: 'SET_GENRE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_SHOW_SCORE_CARD: 'SET_SHOW_SCORE_CARD',
  SET_GAME_CONFIGURATION: 'SET_GAME_CONFIGURATION',
  RESET_GAME: 'RESET_GAME',
  END_GAME: 'END_GAME',
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TEST_TEXT:
      return { 
        ...state, 
        testText: action.payload,
        charClasses: Array(action.payload.length).fill('default')
      };
    case ACTIONS.SET_USER_INPUT:
      return { ...state, userInput: action.payload };
    case ACTIONS.SET_CHAR_CLASSES:
      return { ...state, charClasses: action.payload };
    case ACTIONS.SET_TEST_STARTED:
      return { ...state, testStarted: action.payload };
    case ACTIONS.SET_TEST_DURATION:
      return { ...state, testDuration: action.payload };
    case ACTIONS.SET_TIME_REMAINING:
      return { ...state, timeRemaining: action.payload };
    case ACTIONS.SET_WPM:
      return { ...state, wpm: action.payload };
    case ACTIONS.SET_ACCURACY:
      return { ...state, accuracy: action.payload };
    case ACTIONS.SET_SCORE:
      return { ...state, score: action.payload };
    case ACTIONS.SET_CURRENT_INDEX:
      return { ...state, currentIndex: action.payload };
    case ACTIONS.SET_DIFFICULTY_LEVEL:
      return { ...state, difficultyLevel: action.payload };
    case ACTIONS.SET_TEST_TYPE:
      return { ...state, testType: action.payload };
    case ACTIONS.SET_GENRE:
      return { ...state, genre: action.payload };
    case ACTIONS.SET_LANGUAGE:
      return { ...state, language: action.payload };
    case ACTIONS.SET_SHOW_SCORE_CARD:
      return { ...state, showScoreCard: action.payload };
    case ACTIONS.SET_GAME_CONFIGURATION:
      return {
        ...state,
        testText: action.payload.testText,
        testDuration: action.payload.testDuration,
        timeRemaining: action.payload.testDuration,
        difficultyLevel: action.payload.difficultyLevel,
        testType: action.payload.testType,
        genre: action.payload.genre,
        language: action.payload.language,
        userInput: '',
        currentIndex: 0,
        charClasses: Array(action.payload.testText.length).fill('default'),
        testStarted: false,
        wpm: '-',
        accuracy: '-',
        score: 0,
        showScoreCard: false,
      };
    case ACTIONS.RESET_GAME:
      return {
        ...state,
        userInput: '',
        currentIndex: 0,
        wpm: '-',
        accuracy: '-',
        charClasses: Array(state.testText.length).fill('default'),
        testStarted: true,
        timeRemaining: state.testDuration,
        showScoreCard: false,
      };
    case ACTIONS.END_GAME:
      const { wpm, accuracy, score } = action.payload;
      return {
        ...state,
        testStarted: false,
        wpm,
        accuracy,
        score,
        showScoreCard: true,
      };
    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

// Context provider
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load initial paragraph based on configuration
  useEffect(() => {
    const loadParagraph = async () => {
      // You might want to modify GenreDescription to accept multiple parameters
      const paragraph = await GenreDescription(state.difficultyLevel);
      dispatch({ type: ACTIONS.SET_TEST_TEXT, payload: paragraph });
    };
    loadParagraph();
  }, [state.difficultyLevel]);

  // Helper functions
  const calculateWPM = (typedChars, duration) => {
    const wordsTyped = typedChars / 5;
    const minutes = duration / 60;
    return (wordsTyped / minutes).toFixed(2);
  };

  const calculateAccuracy = (correctChars, typedChars) => {
    return ((correctChars / typedChars) * 100).toFixed(2);
  };

  // Game actions
  const actions = {
    // Add new method to set game configuration
    setGameConfiguration: (config) => {
      dispatch({ 
        type: ACTIONS.SET_GAME_CONFIGURATION, 
        payload: config 
      });
    },

    startTest: () => {
      dispatch({ type: ACTIONS.RESET_GAME });
    },
    
    endTest: () => {
      const typedChars = state.userInput.length;
      const correctChars = state.charClasses.filter(c => c === 'correct').length;
      
      const newWPM = calculateWPM(typedChars, state.testDuration);
      const newAccuracy = calculateAccuracy(correctChars, typedChars);
      const newScore = Math.round((newWPM * 0.4) + (newAccuracy * 0.6));
      
      dispatch({ 
        type: ACTIONS.END_GAME, 
        payload: { 
          wpm: newWPM, 
          accuracy: newAccuracy, 
          score: newScore 
        } 
      });
    },
    
    handleInput: (inputValue) => {
      if (!state.testStarted) return;
    
      // Get the last character typed (or removed)
      const lastTypedChar = inputValue.length > 0 ? 
        inputValue[inputValue.length - 1] : '';
      
      const newCharClasses = [...state.charClasses];
      let newIndex = state.currentIndex;
      
      // When backspacing
      if (inputValue.length < state.userInput.length) {
        // Handle backspace
        if (newIndex > 0) {
          newIndex--;
          newCharClasses[newIndex] = 'default';
        }
      } 
      // When typing new characters
      else if (newIndex < state.testText.length && inputValue.length > state.userInput.length) {
        // Check if current character matches the text
        const expectedChar = state.testText[newIndex];
        const typedChar = inputValue[inputValue.length - 1];
        
        if (typedChar === expectedChar) {
          newCharClasses[newIndex] = 'correct';
        } else {
          newCharClasses[newIndex] = 'wrong';
        }
        
        newIndex++;
      }
    
      dispatch({ type: ACTIONS.SET_USER_INPUT, payload: inputValue });
      dispatch({ type: ACTIONS.SET_CURRENT_INDEX, payload: newIndex });
      dispatch({ type: ACTIONS.SET_CHAR_CLASSES, payload: newCharClasses });
    
      // Calculate WPM and accuracy
      const typedChars = inputValue.length;
      const correctChars = newCharClasses.filter((c) => c === 'correct').length;
      
      if (typedChars > 0) {
        const newWPM = calculateWPM(typedChars, state.testDuration);
        const newAccuracy = calculateAccuracy(correctChars, typedChars);
        
        dispatch({ type: ACTIONS.SET_WPM, payload: newWPM });
        dispatch({ type: ACTIONS.SET_ACCURACY, payload: newAccuracy });
      }
    },
    
    
    setTestDuration: (duration) => {
      dispatch({ type: ACTIONS.SET_TEST_DURATION, payload: parseInt(duration) });
    },
    
    setDifficultyLevel: (level) => {
      dispatch({ type: ACTIONS.SET_DIFFICULTY_LEVEL, payload: level });
    },
    
    setTimeRemaining: (time) => {
      dispatch({ type: ACTIONS.SET_TIME_REMAINING, payload: time });
    },
    
    setShowScoreCard: (show) => {
      dispatch({ type: ACTIONS.SET_SHOW_SCORE_CARD, payload: show });
    },

    // Additional setters for new configuration options
    setTestType: (type) => {
      dispatch({ type: ACTIONS.SET_TEST_TYPE, payload: type });
    },

    setGenre: (genre) => {
      dispatch({ type: ACTIONS.SET_GENRE, payload: genre });
    },

    setLanguage: (language) => {
      dispatch({ type: ACTIONS.SET_LANGUAGE, payload: language });
    }
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook for using game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}