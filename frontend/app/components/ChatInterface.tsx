'use client'

import React, { KeyboardEvent, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { Sequence } from '../types';
import ChatHeader from './chat/ChatHeader';
import MessageBubble from './chat/MessageBubble';
import ChatInput from './chat/ChatInput';

interface ChatInterfaceProps {
  sequences: Sequence[];
  onSequenceCreated: (sequence: Sequence) => void;
  selectedSequence?: Sequence | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sequences, onSequenceCreated, selectedSequence }) => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    handleSendMessage,
    handleClearChat,
  } = useChat({ onSequenceCreated });

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(selectedSequence?.id || null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <ChatHeader onClear={handleClearChat} />
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="bg-gray-800 text-white rounded-2xl px-3 py-2 rounded-tl-none">
                <p>Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSend={() => handleSendMessage(selectedSequence?.id || null)}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatInterface;