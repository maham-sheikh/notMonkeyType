import React, { useEffect } from 'react';
import { KeyIcon, HashIcon, ArrowRightCircleIcon } from 'lucide-react';
import { ActionButton } from '../../common/ConfigUI';
import SocketService from '../../../services/SocketService';
import MultiplayerService from '../../../services/MultiplayerService';

const JoinRoomInput = ({ inputRef, formState, updateFormState, parentLoading, setRoomCode }) => {
  // Focus the input when component mounts
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  }, [inputRef]);

  const handleEnterRoom = async () => {
    if (!inputRef.current?.value) return;
    
    const enteredCode = inputRef.current.value.trim().toUpperCase();
    
    if (enteredCode.length < 3) {
      updateFormState({ error: 'Room code must be at least 3 characters' });
      return;
    }
    
    try {
      updateFormState({ loading: true, error: null });
      
      if (!SocketService.isConnected()) {
        SocketService.reconnect();
      }
      
      // Check if room exists and is available
      const availability = await MultiplayerService.checkRoomAvailability(enteredCode);
      
      if (!availability.exists) {
        updateFormState({ error: 'Room does not exist' });
        return;
      }
      
      if (!availability.available) {
        updateFormState({ error: `Room is not available (${availability.status})` });
        return;
      }
      
      // Join the room
      await MultiplayerService.joinRoom(enteredCode);
      setRoomCode(enteredCode);
    } catch (err) {
      updateFormState({ error: err.message || 'Failed to join room' });
    } finally {
      updateFormState({ loading: false });
    }
  };

  return (
    <div className="bg-gradient-to-br from-black/30 to-black/60 rounded-xl p-8 border border-white/10 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <KeyIcon className="text-accent" size={18} />
          <p className="text-accent font-bold">Enter Room Code</p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <HashIcon size={120} />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="ABCD12"
            maxLength={6}
            autoCapitalize="characters"
            className="w-full bg-black/30 border border-white/20 rounded-lg p-4 text-white text-center font-mono tracking-[0.2em] text-4xl uppercase focus:outline-none focus:ring-2 focus:ring-accent/50"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleEnterRoom();
            }}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <ActionButton 
          onClick={handleEnterRoom}
          // disabled={ !(inputRef.current && inputRef.current.value.length >= 3)}
          icon={<ArrowRightCircleIcon size={20} />}
          className="w-full"
        >
          Join Now
        </ActionButton>
      </div>
    </div>
  );
};

export default JoinRoomInput;