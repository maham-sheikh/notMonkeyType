import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleIcon, XIcon, SendIcon } from 'lucide-react';

const ChatPanel = ({ messages, chatInput, setChatInput, onSendMessage, onClose }) => {
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Format timestamp
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-4 right-4 w-80 h-96 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 flex flex-col overflow-hidden z-30"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageCircleIcon className="text-accent" size={18} />
          <h3 className="text-white font-medium">Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <XIcon size={18} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/40 text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] ${msg.isPlayer ? 'ml-auto' : 'mr-auto'}`}
            >
              <div
                className={`rounded-lg px-3 py-2 ${
                  msg.isPlayer
                    ? 'bg-accent/20 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {!msg.isPlayer && (
                  <p className="text-xs font-medium text-accent mb-1">{msg.userName}</p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
              </div>
              <p className="text-xs text-white/40 mt-1">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder-white/40"
            rows={1}
          />
          <button
            onClick={onSendMessage}
            disabled={!chatInput.trim()}
            className="p-2 rounded-lg bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPanel;