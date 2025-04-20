import React from 'react';
import { LogInIcon } from 'lucide-react';
import { ActionButton } from '../../common/ConfigUI';

const JoinRoomButton = ({ formState, updateFormState, parentLoading }) => {
  const handleJoinClick = () => {
    updateFormState({ showInput: !formState.showInput });
  };

  return (
    <ActionButton 
      onClick={handleJoinClick}
      disabled={formState.loading || parentLoading}
      variant="secondary"
      className="h-auto p-5 justify-start"
      icon={<LogInIcon size={24} />}
      iconPosition="left"
      onMouseEnter={() => updateFormState({ hoveredButton: 'join' })}
      onMouseLeave={() => updateFormState({ hoveredButton: null })}
    >
      <div className="text-left">
        <div className="font-bold text-lg">Join Room</div>
        <div className="text-sm opacity-80">Enter existing code</div>
      </div>
    </ActionButton>
  );
};

export default JoinRoomButton;