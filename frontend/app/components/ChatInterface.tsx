'use client'

import React, { useState, KeyboardEvent, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { createSession, sendMessage, getMessages} from '../services/chat';
import { Message, ChatMessage, Sequence } from '../types';


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

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
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

interface ChatInterfaceProps {
  onSequenceCreated: (sequence: Sequence) => void;
}

// Main Component
const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSequenceCreated }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Initializing chat...');
        // Create a new session
        const session = await createSession(
          'Recruiting Assistant Chat',
          {
            role: 'recruiting_assistant',
            context: 'You are a helpful AI assistant specialized in recruitment and sales.'
          }
        );
        setSessionId(session.session_id);
        
        // Load initial messages
        const initialMessages = await getMessages(session.session_id);
        console.log('Initial messages loaded:', initialMessages);
        setMessages(initialMessages.map((msg: Message) => ({
          text: msg.message,
          sender: msg.role === 'user' ? 'user' : 'ai'
        })));
      } catch (error) {
        console.error('Error initializing chat:', error);
        // Fallback to default message
        setMessages([{
          text: "Hello! I'm your AI recruiting assistant. How can I help you today?",
          sender: 'ai'
        }]);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) {
      console.log('Cannot send message:', { inputMessage, sessionId });
      return;
    }

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      console.log('Sending message to session:', sessionId);
      const response = await sendMessage(sessionId, userMessage);
      console.log('Received response:', response);
      setMessages(prev => [...prev, { 
        text: response.message,
        sender: 'ai'
      }]);

      // If a sequence was created or updated, notify the parent
      if (response.sequence) {
        onSequenceCreated(response.sequence);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (!sessionId) return;
    
    try {
      // Create a new session
      const session = await createSession(
        'Recruiting Assistant Chat',
        {
          role: 'recruiting_assistant',
          context: 'You are a helpful AI assistant specialized in recruitment and sales.'
        }
      );
      setSessionId(session.session_id);
      
      // Reset messages
      setMessages([{
        text: "Hello! I'm your AI recruiting assistant. How can I help you today?",
        sender: 'ai'
      }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
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
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatInterface;