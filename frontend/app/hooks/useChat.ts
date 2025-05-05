import { useState, useEffect } from 'react';
import { createSession, sendMessage, getMessages } from '../services/api';
import { Message, Sequence, ChatMessage } from '../types'; 
import { useSequence } from './useSequence';

interface UseChatProps {
  onSequenceCreated?: (sequence: Sequence) => void;
}

export const useChat = ({ onSequenceCreated }: UseChatProps = {}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createSequence, generateSequence } = useSequence();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Initializing chat...');
        const session = await createSession(
          'Recruiting Assistant Chat',
          {
            role: 'recruiting_assistant',
            context: 'You are a helpful AI assistant specialized in recruitment and sales.'
          }
        );
        setSessionId(session.session_id);
        
        const initialMessages = await getMessages(session.session_id);
        console.log('Initial messages loaded:', initialMessages);
        setMessages(initialMessages.map((msg: Message) => ({
          text: msg.message,
          sender: msg.role === 'user' ? 'user' : 'ai'
        })));
      } catch (error) {
        console.error('Error initializing chat:', error);
        setMessages([{
          text: "Hello! I'm your AI recruiting assistant. How can I help you today?",
          sender: 'ai'
        }]);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (sequenceId: string | null) => {
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
      const response = await sendMessage(sessionId, userMessage, sequenceId);
      console.log('Received response:', response);
      setMessages(prev => [...prev, { 
        text: response.message,
        sender: 'ai'
      }]);

      if (response.sequence && onSequenceCreated) {
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

  const handleClearChat = async () => {
    if (!sessionId) return;
    
    try {
      const session = await createSession(
        'Recruiting Assistant Chat',
        {
          role: 'recruiting_assistant',
          context: 'You are a helpful AI assistant specialized in recruitment and sales.'
        }
      );
      setSessionId(session.session_id);
      
      setMessages([{
        text: "Hello! I'm your AI recruiting assistant. How can I help you today?",
        sender: 'ai'
      }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    handleSendMessage,
    handleClearChat
  };
}; 