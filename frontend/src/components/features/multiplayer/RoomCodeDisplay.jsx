import React from 'react';
import { KeyIcon, HashIcon, RefreshCwIcon, ArrowRightCircleIcon } from 'lucide-react';
import { ActionButton } from '../../common/ConfigUI';
import SocketService from '../../../services/SocketService';
import MultiplayerService from '../../../services/MultiplayerService';

const RoomCodeDisplay = ({ formState, updateFormState, config, animateNumberChange, parentLoading }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formState.generatedCode);
    updateFormState({ isCodeCopied: true });
    setTimeout(() => updateFormState({ isCodeCopied: false }), 2000);
  };

  const handleRegenerateCode = async () => {
    updateFormState({ loading: true, error: null });
    
    try {
      const response = await MultiplayerService.createRoom(config);
      updateFormState({
        generatedCode: response.roomId,
        selfCode: response.roomId
      });
      animateNumberChange(response.roomId);
    } catch (err) {
      updateFormState({ error: err.message || 'Failed to regenerate room code' });
    } finally {
      updateFormState({ loading: false });
    }
  };

  const handleEnterSelfCode = () => {
    if (formState.generatedCode) {
      if (!SocketService.isConnected()) {
        SocketService.reconnect();
      }
      updateFormState({ showConfiguration: true });
    }
  };

  return (
    <div className="bg-gradient-to-br from-black/30 to-black/60 rounded-xl p-8 border border-white/10 animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <KeyIcon className="text-accent" size={18} />
            <p className="text-accent font-bold">Room Code</p>
          </div>
          
          <button 
            onClick={copyToClipboard} 
            className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            {formState.isCodeCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <HashIcon size={120} />
          </div>
          <span className="text-white text-4xl font-mono tracking-[0.5em] pl-[0.5em]">{formState.selfCode}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ActionButton 
          onClick={handleRegenerateCode}
          disabled={formState.loading || parentLoading}
          variant="secondary"
          icon={<RefreshCwIcon size={18} />}
          iconPosition="left"
        >
          New Code
        </ActionButton>
        
        <ActionButton 
          onClick={handleEnterSelfCode}
          disabled={formState.loading || parentLoading}
          icon={<ArrowRightCircleIcon size={20} />}
          className="flex-1"
        >
          Enter Room
        </ActionButton>
      </div>
    </div>
  );
};

export default RoomCodeDisplay;