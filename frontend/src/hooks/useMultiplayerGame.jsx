import { useState, useEffect, useRef } from 'react';
import SocketService from '../services/SocketService';
import { getUserId } from '../services/authService';

/**
 * Custom hook to manage multiplayer game state and logic
 * @returns {Object} Game state, methods, and handlers
 */
const useMultiplayerGame = () => {
  // Game state
  const [gameState, setGameState] = useState({
    roomCode: '',
    isHost: false,
    canStartMatch: false,
    isWaiting: false,
    showForm: true,
    testText: '',
    testStarted: false,
    testCompleted: false,
    timeRemaining: 60,
    countdown: 3,
    playerInfo: null,
    opponentInfo: null,
    showScoreCard: false,
    gameResults: null
  });

  // Input state
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charClasses, setCharClasses] = useState([]);
  
  // Performance metrics
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    score: 0,
    progress: 0,
    opponentProgress: 0
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  /**
   * Update game state with partial updates
   * @param {Object} updates - Partial state updates
   */
  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Update performance stats with partial updates
   * @param {Object} updates - Partial stats updates
   */
  const updateStats = (updates) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  // Initialize socket connection and set up event listeners
  useEffect(() => {
    console.log('Initializing socket connection');
    SocketService.connect();
    
    const unsubscribe = [
      SocketService.on('room-joined', (data) => {
        console.log('Room joined event received', data);
        handleRoomJoined(data);
      }),
      
      SocketService.on('player-joined', (data) => {
        console.log('Player joined event received', data);
        handlePlayerJoined(data);
      }),
      
      SocketService.on('game-starting', (data) => {
        console.log('Game starting event received', data);
        handleGameStarting(data);
      }),
      
      SocketService.on('opponent-progress', (data) => {
        handleOpponentProgress(data);
      }),
      
      SocketService.on('game-completed', (data) => {
        console.log('Game completed event received', data);
        handleGameCompleted(data);
      }),
      
      SocketService.on('error', (errorMsg) => {
        console.error('Socket error received:', errorMsg);
        setError(errorMsg.message || 'An error occurred');
      }),
      
      SocketService.on('player-disconnected', () => {
        console.log('Player disconnected event received');
        setError('Opponent disconnected');
      })
    ];
    
    // Cleanup function
    return () => {
      console.log('Cleaning up socket listeners and timers');
      unsubscribe.forEach(fn => fn());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      SocketService.disconnect();
    };
  }, []);

  // Join room when room code is set
  useEffect(() => {
    if (gameState.roomCode) {
      console.log(`Joining room: ${gameState.roomCode}`);
      SocketService.joinRoom(gameState.roomCode);
    }
  }, [gameState.roomCode]);

  // Enable start button for host when opponent joins
  useEffect(() => {
    if (gameState.opponentInfo && gameState.opponentInfo.userId && gameState.isHost) {
      console.log('Opponent joined, enabling start match for host');
      updateGameState({ canStartMatch: true, isWaiting: false });
    }
  }, [gameState.opponentInfo]);

  // Track typing progress and stats
  useEffect(() => {
    if (!gameState.testStarted || gameState.testCompleted) return;

    const correctChars = charClasses.filter(c => c === 'correct').length;
    const typedChars = userInput.length;
    const elapsedTime = 60 - gameState.timeRemaining;
    
    if (typedChars > 0 && elapsedTime > 0) {
      const newProgress = Math.round((currentIndex / gameState.testText.length) * 100);
      const newWpm = calculateWPM(typedChars, elapsedTime);
      const newAccuracy = calculateAccuracy(correctChars, typedChars);
      const newScore = Math.round((newWpm * 0.6) + (newAccuracy * 0.4));
      
      updateStats({
        progress: newProgress,
        wpm: newWpm,
        accuracy: newAccuracy,
        score: newScore
      });
      
      SocketService.updateProgress(
        gameState.roomCode, 
        newProgress, 
        newWpm, 
        newAccuracy, 
        newScore
      );
      
      if (currentIndex === gameState.testText.length) {
        endTest();
      }
    }
  }, [currentIndex, gameState.testStarted, gameState.timeRemaining, gameState.testCompleted, gameState.testText]);

  // End test when timer reaches zero
  useEffect(() => {
    if (gameState.testStarted && !gameState.testCompleted && gameState.timeRemaining === 0) {
      console.log('Timer reached zero, ending test');
      endTest();
    }
  }, [gameState.timeRemaining, gameState.testStarted, gameState.testCompleted]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameState.testStarted || gameState.testCompleted) return;
      
      // Handle backspace
      if (e.key === 'Backspace' && currentIndex > 0) {
        e.preventDefault();
        const newCharClasses = [...charClasses];
        newCharClasses[currentIndex - 1] = 'default';
        
        setCurrentIndex(prev => prev - 1);
        setCharClasses(newCharClasses);
        setUserInput(prev => prev.slice(0, -1));
        return;
      }
      
      // Ignore non-character keys
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Handle character input
      if (currentIndex < gameState.testText.length) {
        const newCharClasses = [...charClasses];
        
        if (e.key === gameState.testText[currentIndex]) {
          newCharClasses[currentIndex] = 'correct';
        } else {
          newCharClasses[currentIndex] = 'wrong';
        }
        
        setCurrentIndex(prev => prev + 1);
        setCharClasses(newCharClasses);
        setUserInput(prev => prev + e.key);
      }
    };
    
    if (gameState.testStarted && !gameState.testCompleted) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.testStarted, gameState.testCompleted, currentIndex, gameState.testText]);

  /**
   * Socket event handler for room joined
   * @param {Object} data - Room data from server
   */
  function handleRoomJoined(data) {
    console.log('Processing room joined data', data);
    const userId = getUserId();
    
    updateGameState({
      showForm: false,
      isHost: data.isHost,
      isWaiting: !data.opponentInfo?.userId,
      testText: data.generatedContent,
      playerInfo: data.playerInfo,
      opponentInfo: data.opponentInfo,
      timeRemaining: data.contentConfig?.testDuration || 60
    });
    
    setCharClasses(Array(data.generatedContent.length).fill('default'));
  }

  /**
   * Socket event handler for player joined
   * @param {Object} data - Player data from server
   */
  function handlePlayerJoined(data) {
    console.log('Processing player joined data', data);
    const userId = getUserId();
    
    if (data.userId !== userId) {
      updateGameState({
        opponentInfo: {
          userId: data.userId,
          name: data.name || 'Opponent',
          isHost: data.isHost || false,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          score: 0
        },
        isWaiting: false
      });
      
      if (gameState.isHost) {
        updateGameState({ canStartMatch: true });
      }
    }
  }

  /**
   * Socket event handler for game starting
   */
  function handleGameStarting(data) {
    console.log('Game starting handler called', data);
    updateGameState({ isWaiting: false });
    startCountdown();
  }

  /**
   * Socket event handler for opponent progress updates
   * @param {Object} data - Opponent progress data
   */
  // In useMultiplayerGame.js, replace the handleOpponentProgress function:

/**
 * Socket event handler for opponent progress updates
 * @param {Object} data - Opponent progress data
 */
function handleOpponentProgress(data) {
  console.log('Received opponent progress update:', data);
  const userId = getUserId();
  
  // Only update if this is the opponent's progress
  if (data.userId !== userId) {
    // Force direct state update with specific new object
    const opponentData = {
      wpm: data.wpm || 0,
      accuracy: data.accuracy || 0,
      score: data.score || 0,
      progress: data.progress || 0
    };
    
    console.log('Updating opponent stats with:', opponentData);
    
    // Update both state objects more directly
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        opponentProgress: data.progress || 0
      };
      console.log('New stats state:', newStats);
      return newStats;
    });
    
    setGameState(prevState => {
      // Create complete new state object with merged opponent info
      const newOpponentInfo = {
        ...(prevState.opponentInfo || {}),
        userId: data.userId,
        name: prevState.opponentInfo?.name || 'Opponent',
        wpm: data.wpm,
        accuracy: data.accuracy,
        score: data.score,
        progress: data.progress
      };
      
      const newState = {
        ...prevState,
        opponentInfo: newOpponentInfo
      };
      
      console.log('New game state:', newState);
      return newState;
    });
  }
}
  /**
   * Socket event handler for game completed
   * @param {Object} data - Game results data
   */
  function handleGameCompleted(data) {
    console.log('Processing game completed data', data);
    const userId = getUserId();
    
    updateGameState({
      gameResults: {
        players: data.performances.map(p => ({
          ...p,
          isPlayer: p.userId === userId,
          displayName: p.userId === userId ? 'You' : p.name
        })),
        isWinner: data.winnerId === userId,
        isTie: data.isTie
      },
      showScoreCard: true,
      testCompleted: true
    });
  }

  /**
   * Start the countdown before test begins
   */
  function startCountdown() {
    console.log('Starting countdown sequence');
    
    // Clear any existing timers
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial countdown state
    updateGameState({ 
      countdown: 3,
      testStarted: false,
      testCompleted: false 
    });
    
    // Use setTimeout chain for more reliable execution
    setTimeout(() => {
      console.log("Countdown: 3");
      
      setTimeout(() => {
        console.log("Countdown: 2");
        updateGameState({ countdown: 2 });
        
        setTimeout(() => {
          console.log("Countdown: 1");
          updateGameState({ countdown: 1 });
          
          setTimeout(() => {
            console.log("Countdown: 0, starting game");
            updateGameState({ countdown: 0 });
            startTest();
          }, 1000);
        }, 1000);
      }, 1000);
    }, 0);
  }

  /**
   * Start the typing test
   */
  function startTest() {
    console.log('Starting test - initializing game state');
    
    // Reset input state
    setUserInput('');
    setCurrentIndex(0);
    setCharClasses(Array(gameState.testText.length).fill('default'));
    
    // Reset stats
    updateStats({
      wpm: 0,
      accuracy: 100,
      score: 0,
      progress: 0
    });
    
    // Set game as started BEFORE initializing timer
    updateGameState({ 
      testStarted: true,
      testCompleted: false,
      timeRemaining: 60 // Reset timer explicitly
    });
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Small delay to ensure state is updated before starting timer
    setTimeout(() => {
      console.log('Initializing game timer');
      
      // Use local variable for more reliable timing
      let timeLeft = 60;
      
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        console.log(`Timer tick: ${timeLeft}s remaining`);
        
        if (timeLeft <= 0) {
          console.log('Timer reached zero');
          clearInterval(timerRef.current);
          timerRef.current = null;
          updateGameState({ timeRemaining: 0 });
          endTest();
        } else {
          updateGameState({ timeRemaining: timeLeft });
        }
      }, 1000);
      
      // Focus input for typing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log('Input focused');
        }
      }, 100);
      
      // Notify server player is ready
      console.log('Notifying server player is ready');
      SocketService.setPlayerReady(gameState.roomCode);
      
    }, 50); // Small delay to ensure UI update
  }

  /**
   * End the typing test
   */
  function endTest() {
    try {
      console.log('Ending test - finalizing results');
      console.log(`Current room code: ${gameState.roomCode}`);
      
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Defensive check for input data
      if (!charClasses || !userInput) {
        console.error('Missing typing data for calculating final stats');
        return; // Exit early if we don't have the required data
      }
      
      // Calculate final stats
      const correctChars = charClasses.filter(c => c === 'correct').length;
      const typedChars = userInput.length;
      const elapsedTime = Math.max(1, 60 - gameState.timeRemaining); // Ensure we don't divide by zero
      
      // Calculate stats with safety checks
      const calcWpm = calculateWPM(typedChars, elapsedTime);
      const calcAccuracy = calculateAccuracy(correctChars, typedChars);
      const calcScore = Math.round((calcWpm * 0.6) + (calcAccuracy * 0.4));
      
      console.log(`Calculated final stats - WPM: ${calcWpm}, Accuracy: ${calcAccuracy}, Score: ${calcScore}`);
      
      // Update final stats
      updateStats({
        wpm: calcWpm,
        accuracy: calcAccuracy,
        score: calcScore,
        progress: 100
      });
      
      // Mark game as completed
      updateGameState({
        testStarted: false,
        testCompleted: true
      });
      
      // Send final stats to server
      if (gameState.roomCode) {
        console.log(`Sending final stats to server for room: ${gameState.roomCode}`);
        SocketService.playerFinished(gameState.roomCode, {
          wpm: calcWpm,
          accuracy: calcAccuracy,
          score: calcScore,
          finishedAt: new Date().toISOString() 
        });
      } else {
        console.error('Cannot send final stats: Room code is missing');
      }
    } catch (error) {
      console.error('Error in endTest function:', error);
      // Attempt to recover by setting basic completion state
      updateGameState({
        testStarted: false,
        testCompleted: true
      });
    }
  }

  /**
   * Host initiates match start
   */
  function handleHostStart() {
    console.log("Host Start button clicked");
    
    // Validate host status
    if (!gameState.isHost) {
      setError('Only the host can start the match');
      return;
    }

    // Validate opponent has joined
    if (!gameState.opponentInfo?.userId) {
      setError('Waiting for opponent to join');
      return;
    }

    // Start the game locally first
    console.log("Starting game countdown locally");
    startCountdown();
    
    // Notify server and other players
    try {
      console.log("Notifying other players via socket");
      SocketService.hostStartMatch(gameState.roomCode);
      
      // Use peer notification as fallback
      console.log("Sending peer notification as fallback");
      SocketService.notifyPeerDirectly(gameState.roomCode, 'game-starting', {
        startTime: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error notifying server about game start:', err);
    }
  }

  /**
   * Reset game state and return to form
   */
  function resetGame() {
    console.log("Resetting game state");
    
    // Stop all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    // Reset all state
    setUserInput('');
    setCurrentIndex(0);
    setCharClasses([]);
    updateStats({
      wpm: 0,
      accuracy: 100,
      score: 0,
      progress: 0,
      opponentProgress: 0
    });
    updateGameState({
      roomCode: '',
      isHost: false,
      canStartMatch: false,
      isWaiting: false,
      showForm: true,
      testText: '',
      testStarted: false,
      testCompleted: false,
      timeRemaining: 60,
      countdown: 3,
      playerInfo: null,
      opponentInfo: null,
      showScoreCard: false,
      gameResults: null
    });
    
    setError('');
  }

  /**
   * Calculate words per minute
   * @param {number} typedChars - Number of characters typed
   * @param {number} elapsedTimeInSeconds - Elapsed time in seconds
   * @returns {number} - Calculated WPM
   */
  function calculateWPM(typedChars, elapsedTimeInSeconds) {
    if (elapsedTimeInSeconds === 0) return 0;
    const wordsTyped = typedChars / 5;
    const minutes = elapsedTimeInSeconds / 60;
    return Math.round(wordsTyped / minutes);
  }

  /**
   * Calculate typing accuracy
   * @param {number} correctChars - Number of correctly typed characters
   * @param {number} typedChars - Total number of typed characters
   * @returns {number} - Accuracy percentage
   */
  function calculateAccuracy(correctChars, typedChars) {
    return typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100;
  }

  /**
   * Set room code and join room
   * @param {string} code - Room code to join
   */
  function setRoomCode(code) {
    console.log(`Setting room code: ${code}`);
    updateGameState({ roomCode: code });
  }

  /**
   * Toggle score card visibility
   * @param {boolean} visible - Whether to show score card
   */
  function toggleScoreCard(visible) {
    updateGameState({ showScoreCard: visible });
  }

  // Return everything needed by component
  return {
    // State
    gameState,
    userInput,
    currentIndex,
    charClasses,
    stats,
    loading,
    error,
    inputRef,
    
    // Actions
    handleHostStart,
    resetGame,
    endTest,
    setRoomCode,
    toggleScoreCard,
    setError
  };
};

export default useMultiplayerGame;