'use client'

import React, { useState, KeyboardEvent } from 'react';
import { Send, Trash2 } from 'lucide-react';

// Types
interface Message {
  text: string;
  sender: 'user' | 'ai';
}

// Components
const ChatHeader: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="p-3 border-b border-gray-800 flex justify-between items-center">
    <h1 className="text-xl font-semibold text-white">Helix AI Recruiting Assistant</h1>
    <button
      onClick={onClear}
      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      title="Clear chat"
    >
      <Trash2 size={20} />
    </button>
  </div>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
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

const ChatInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
}> = ({ value, onChange, onSend, onKeyPress }) => (
  <div className="sticky bottom-0 p-3 border-t border-gray-800">
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Type your message..."
        className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-400"
      />
      <button 
        onClick={onSend}
        className="p-2 text-white bg-rose-900 rounded-xl hover:bg-rose-800 transition-colors shadow-sm hover:shadow-md"
      >
        <Send size={20} />
      </button>
    </div>
  </div>
);

// Main Component
const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI recruiting assistant. How can I help you today?",
      sender: 'ai'
    },
    {
      text: "I need help with finding candidates for a software engineering position.",
      sender: 'user'
    },
    {
      text: "I'd be happy to help! Could you please provide more details about the position requirements?",
      sender: 'ai'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages(prev => [...prev, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I understand. Let me help you with that.", 
          sender: 'ai' 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      text: "Hello! I'm your AI recruiting assistant. How can I help you today?",
      sender: 'ai'
    }]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <ChatHeader onClear={handleClearChat} />
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </div>

      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatInterface;