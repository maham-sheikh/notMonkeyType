import React from 'react';
import { PlusCircleIcon } from 'lucide-react';
import { ActionButton } from './../../common/ConfigUI';
import SocketService from '../../../services/SocketService';
import MultiplayerService from '../../../services/MultiplayerService';

const CreateRoomButton = ({ 
  config, 
  formState, 
  updateFormState, 
  parentLoading, 
  setRoomCode 
}) => {
  const handleCreateClick = async () => {
    // Set loading state immediately
    updateFormState({ loading: true, error: null });
    
    try {
      // Use default configuration if none provided
      const finalConfig = config || {
        type: 'paragraph',
        level: 'intermediate',
        genre: 'general',
        testDuration: 60
      };
      
      // Step 1: Ensure socket connection
      if (!SocketService.isConnected()) {
        await SocketService.connect();
        
        // Verify connection was established
        if (!SocketService.isConnected()) {
          throw new Error('Could not establish connection to game server');
        }
      }
      
      // Step 2: Create room via API
      const roomResponse = await MultiplayerService.createRoom(finalConfig);
      
      if (!roomResponse || !roomResponse.roomId) {
        throw new Error('Server returned invalid room data');
      }
      
      const roomId = roomResponse.roomId;
      
      // Step 3: Join the created room
      const joinResult = SocketService.joinRoom(roomId);
      
      if (!joinResult) {
        throw new Error('Created room but failed to join. Please try again.');
      }
      
      // Step 4: Set room code to navigate to game
      setRoomCode(roomId);
      
    } catch (error) {
      // Handle errors
      const errorMessage = error.message || 'Failed to create room. Please try again.';
      updateFormState({ error: errorMessage });
    } finally {
      // Always reset loading state
      updateFormState({ loading: false });
    }
  };

  return (
    <ActionButton 
      onClick={handleCreateClick}
      disabled={formState.loading || parentLoading}
      variant="secondary"
      className="h-auto p-5 justify-start"
      icon={<PlusCircleIcon size={24} />}
      iconPosition="left"
    >
      <div className="text-left">
        <div className="font-bold text-lg">Create Room</div>
        <div className="text-sm opacity-80">Generate new code</div>
      </div>
    </ActionButton>
  );
};

export default CreateRoomButton;