import { ChatResponse, Message, Session } from '../types';
import { api } from './api';



export const createSession = async (title: string, context: Record<string, any> = {}) => {
  try {
    console.log('Creating session with:', { title, context });
    const response = await api.post<Session>('/chat/session', {
      title,
      context
    });
    console.log('Session created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

export const sendMessage = async (
  sessionId: string,
  message: string,
  temperature: number = 0.7,
  maxTokens: number = 1000,
  stream: boolean = false
) => {
  try {
    console.log('Sending message:', { sessionId, message, temperature, maxTokens });
    const response = await api.post<ChatResponse>(`/chat/${sessionId}`, {
      message,
      temperature,
      max_tokens: maxTokens,
      stream
    });
    console.log('Message response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (sessionId: string, limit: number = 10, offset: number = 0) => {
  try {
    console.log('Getting messages for session:', sessionId);
    const response = await api.get<{ messages: Message[] }>(`/chat/${sessionId}/messages`, {
      params: { limit, offset }
    });
    console.log('Messages retrieved:', response.data.messages);
    return response.data.messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const getContext = async (sessionId: string) => {
  try {
    console.log('Getting context for session:', sessionId);
    const response = await api.get<{ context: Record<string, any> }>(`/chat/${sessionId}/context`);
    console.log('Context retrieved:', response.data.context);
    return response.data.context;
  } catch (error) {
    console.error('Error getting context:', error);
    throw error;
  }
};

export const updateContext = async (sessionId: string, context: Record<string, any>) => {
  try {
    console.log('Updating context for session:', sessionId, context);
    const response = await api.put<{ context: Record<string, any> }>(`/chat/${sessionId}/context`, {
      context
    });
    console.log('Context updated:', response.data.context);
    return response.data.context;
  } catch (error) {
    console.error('Error updating context:', error);
    throw error;
  }
}; 