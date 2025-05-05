import axios from 'axios';
import { ChatResponse, Message, Session } from '../types';


const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject({ error: 'No response received from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);




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
  sequenceId: string | null
) => {
  try {
    console.log('Sending message:', { sessionId, message, sequenceId });
    const response = await api.post<ChatResponse>(`/chat/${sessionId}`, {
      message,
      sequenceId
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

export const deleteSequence = async (sequenceId: string): Promise<void> => {
  const response = await fetch(`${baseURL}/sequences/${sequenceId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete sequence');
  }
};

interface SequencesResponse {
  sequences: any[];
}

export const getSequences = async (): Promise<any[]> => {
  try {
    const response = await api.get<SequencesResponse>('/sequences');
    return response.data.sequences || [];
  } catch (error) {
    console.error('Error getting sequences:', error);
    throw error;
  }
};

export const updateSequenceStatus = async (sequenceId: string, isActive: boolean): Promise<any> => {
  try {
    const response = await api.put(`/sequences/${sequenceId}`, {
      is_active: isActive
    });
    return response.data;
  } catch (error) {
    console.error('Error updating sequence status:', error);
    throw error;
  }
}; 

