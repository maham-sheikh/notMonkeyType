import React, { useState, useRef, useEffect } from 'react';
import { UsersIcon } from 'lucide-react';
import SocketService from '../../../services/SocketService';
import NetworkErrorHandler from './NetworkErrorHandler';
import { ErrorDisplay } from './../../common/ConfigUI';

// Custom components
import CreateRoomButton from './CreateRoomButton';
import JoinRoomButton from './JoinRoomButton';
import RoomCodeDisplay from './RoomCodeDisplay';
import JoinRoomInput from './JoinRoomInput';
import ConfigurationForm from './ConfigurationForm';
import LoadingIndicator from './LoadingIndicator';
import SplineVisualization from './SplineVisualization';

const MultiPlayerForm = ({ setRoomCode, loading: parentLoading, error: parentError }) => {
  // Combined state using a single state object
  const [formState, setFormState] = useState({
    showInput: false,
    generatedCode: '',
    selfCode: '',
    hoveredButton: null,
    isCodeCopied: false,
    loading: false,
    error: null,
    showConfiguration: false,
    // Configuration settings
    config: {
      type: 'paragraph',
      level: 'intermediate',
      genre: 'general',
      testDuration: 10
    }
  });
  
  // Reference to input element
  const inputRef = useRef(null);

  // Helper function to update form state
  const updateFormState = (newState) => setFormState(prev => ({...prev, ...newState}));
  
  // Helper function to update config within form state
  const updateConfig = (newConfig) => {
    updateFormState({
      config: {...formState.config, ...newConfig}
    });
  };

  // Initialize socket connection on component mount
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        if (!SocketService.isConnected()) {
          await SocketService.connect();
        }
      } catch (error) {
        updateFormState({ error: "Could not connect to server" });
      }
    };
    
    initializeSocket();
    
    // Listen for socket authentication events
    const unsubscribe = SocketService.on('authenticated', () => {
      console.log('Socket authenticated in MultiPlayerForm');
    });
    
    // Clean up on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Animate room code generation with a visual effect
  const animateNumberChange = (finalCode) => {
    let iterations = 10;
    const interval = setInterval(() => {
      updateFormState({selfCode: Math.floor(100 + Math.random() * 900).toString()});
      iterations--;
      
      if (iterations <= 0) {
        clearInterval(interval);
        updateFormState({selfCode: finalCode});
      }
    }, 50);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-1000 opacity-30"></div>
      
      <div className="w-full max-w-6xl h-[90%] bg-black/5 backdrop-blur-xl rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70 overflow-hidden relative z-10">
        <div className="flex h-full">
          {/* Content Section */}
          <div className="w-[60%] p-12 flex flex-col h-full relative overflow-auto">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none"></div>
            
            {formState.showConfiguration ? (
              <ConfigurationForm 
                config={formState.config}
                setConfig={updateConfig}
                formState={formState}
                updateFormState={updateFormState}
                setRoomCode={setRoomCode}
                parentLoading={parentLoading}
              />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-4 mb-4 animate-fade-in">
                  <div className="bg-accent/20 p-3 rounded-xl">
                    <UsersIcon className="text-accent" size={36} />
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold text-white tracking-tight">Multiplayer</h1>
                    <p className="text-white/60">Challenge friends in real-time</p>
                  </div>
                </div>
                
                <p className="text-xl text-white/80 mb-10 animate-slide-in">
                  Compete head-to-head and see who has the fastest typing skills
                </p>
                
                <NetworkErrorHandler onRetry={() => SocketService.connect()} />
                
                <ErrorDisplay error={formState.error || parentError} />
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-5 mb-10">
                  <CreateRoomButton 
                    config={formState.config}
                    formState={formState}
                    updateFormState={updateFormState}
                    parentLoading={parentLoading}
                    setRoomCode={setRoomCode}
                  />
                  
                  <JoinRoomButton 
                    formState={formState}
                    updateFormState={updateFormState}
                    parentLoading={parentLoading}
                  />
                </div>
                
                {/* Room Code or Join Input */}
                {formState.generatedCode && !formState.showInput ? (
                  <RoomCodeDisplay 
                    formState={formState}
                    updateFormState={updateFormState}
                    config={formState.config}
                    animateNumberChange={animateNumberChange}
                    parentLoading={parentLoading}
                  />
                ) : formState.showInput ? (
                  <JoinRoomInput 
                    inputRef={inputRef}
                    formState={formState}
                    updateFormState={updateFormState}
                    parentLoading={parentLoading}
                    setRoomCode={setRoomCode}
                  />
                ) : null}
                
                {/* Loading State */}
                {formState.loading && <LoadingIndicator />}
                
                <div className="mt-auto pt-6 text-white/40 text-sm">
                  Invite friends to join your room using the room code
                </div>
              </>
            )}
          </div>
          
          {/* Spline 3D Visualization */}
          <SplineVisualization />
        </div>
      </div>
    </div>
  );
};

export default MultiPlayerForm;