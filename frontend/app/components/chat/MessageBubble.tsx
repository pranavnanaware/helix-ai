import React from 'react';
import { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-[80%]">
      <div className={`rounded-2xl px-3 py-2 ${
        message.sender === 'user' 
          ? 'bg-rose-900 text-white rounded-tr-none' 
          : 'bg-gray-800 text-white rounded-tl-none'
      }`}>
        <p>{message.text}</p>
      </div>
      <span className={`text-xs text-gray-400 mt-1 block ${message.sender === 'user' ? 'text-right' : ''}`}>
        {message.sender === 'user' ? 'You' : 'AI Assistant'}
      </span>
    </div>
  </div>
);

export default MessageBubble; 