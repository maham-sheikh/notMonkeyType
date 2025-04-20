import React, { useState, useRef } from 'react';
import Spline from '@splinetool/react-spline';

import Button from '../../ui/Button';
import Card from '../../ui/Card';


import { useAuth } from '../../../context/AuthContext';

const RoomForm = ({ setRoomCode }) => {
  const [showInput, setShowInput] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [selfCode, setSelfCode] = useState('');
  const inputRef = useRef(null);
  const { user } = useAuth();

  // Generate a random 3-digit code
  const generateRandomCode = () => {
    return Math.floor(100 + Math.random() * 900).toString();
  };

  // Handle creating a new room
  const handleCreateClick = () => {
    const newCode = generateRandomCode();
    setGeneratedCode(newCode);
    setSelfCode(newCode);
    setShowInput(false);
  };

  // Handle joining an existing room
  const handleJoinClick = () => {
    setShowInput(!showInput);
    if (!showInput && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Regenerate a new code
  const handleRegenerateCode = () => {
    const newCode = generateRandomCode();
    setGeneratedCode(newCode);
    setSelfCode(newCode);
  };

  // Enter the self-created room
  const handleEnterSelfCode = () => {
    if (selfCode) {
      setRoomCode(selfCode);
    }
  };

  // Enter a room with provided code
  const handleEnterRoom = () => {
    if (showInput && inputRef.current?.value) {
      const enteredCode = inputRef.current.value;
      setRoomCode(enteredCode);
    }
  };

  return (
    <Card className="w-full max-w-4xl" gradient hover>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-8">
          <h1 className="text-4xl font-bold text-white mb-6">Multiplayer Mode</h1>
          <p className="text-white mb-8">
            Challenge your friends or random opponents to a typing duel! Create a room or join an existing one.
          </p>
          
          <div className="flex flex-col space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateClick}
              fullWidth
            >
              Create Room
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={handleJoinClick}
              fullWidth
            >
              Join Room
            </Button>
          </div>
          
          {/* Generated code section */}
          {generatedCode && !showInput && (
            <div className="mt-6 p-4 bg-indigo-900 bg-opacity-50 rounded-lg">
              <p className="text-white text-xl font-bold mb-4">Room Code: {generatedCode}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="ghost"
                  onClick={handleRegenerateCode}
                >
                  Regenerate Code
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleEnterSelfCode}
                >
                  Enter Room
                </Button>
              </div>
            </div>
          )}
          
          {/* Join room section */}
          {showInput && (
            <div className="mt-6 p-4 bg-indigo-900 bg-opacity-50 rounded-lg">
              <div className="mb-4">
                <label htmlFor="roomCode" className="block text-white text-sm font-medium mb-2">
                  Room Code
                </label>
                <input
                  ref={inputRef}
                  id="roomCode"
                  type="text"
                  placeholder="Enter Room Code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <Button
                variant="primary"
                onClick={handleEnterRoom}
                fullWidth
              >
                Enter Room
              </Button>
            </div>
          )}
        </div>
        
        {/* 3D Decoration */}
        <div className="hidden md:block w-1/2 relative h-[400px]">
          <Spline
            className="absolute inset-0"
            scene="https://prod.spline.design/wbGSEgtIeXYtBDkR/scene.splinecode"
          />
        </div>
      </div>
    </Card>
  );
};

export default RoomForm;