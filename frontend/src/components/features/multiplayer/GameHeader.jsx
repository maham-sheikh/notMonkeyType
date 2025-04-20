// Components/features/multiplayer/GameHeader.jsx
import React from 'react';
import { UsersIcon } from 'lucide-react';

const GameHeader = ({ roomCode, isHost, roomData }) => {
  return (
    <div className="flex justify-between items-center my-4">
      <div className="flex items-center gap-3">
        <div className="bg-accent/20 p-2 rounded-lg">
          <UsersIcon className="text-accent" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Room: {roomCode}</h2>
          <p className="text-white/60 text-sm">
            {isHost ? 'You are the host' : 'You joined as guest'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-row gap-8">
        <div className="flex flex-row justify-between">
          <span className="text-white/60">Type:</span>
          <span className="text-white capitalize">{roomData?.contentConfig?.type || 'paragraph'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Level:</span>
          <span className="text-white capitalize">{roomData?.contentConfig?.level || 'intermediate'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Genre:</span>
          <span className="text-white capitalize">{roomData?.contentConfig?.genre || 'general'}</span>
        </div>
        {roomData?.contentConfig?.language && (
          <div className="flex justify-between">
            <span className="text-white/60">Language:</span>
            <span className="text-white capitalize">{roomData.contentConfig.language}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHeader;