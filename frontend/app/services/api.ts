import axios from 'axios';
import { Folder, FileMetadata } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle CORS errors
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

export const getFolders = async (): Promise<Folder[]> => {
  try {
    const response = await api.get<Folder[]>('/folders');
    return response.data;
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
};

export const createFolder = async (name: string): Promise<Folder> => {
  try {
    const response = await api.post<Folder>('/folders', { name });
    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    if (!folderId) {
      throw new Error('Folder ID is required');
    }
    await api.delete(`/folders/${folderId}`);
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

export const uploadFile = async (folderId: string, file: File): Promise<FileMetadata> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', folderId);
    
    const response = await api.post<FileMetadata>('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const createEmbedding = async (fileId: string, embedding: number[]): Promise<void> => {
  try {
    await api.post('/embeddings', {
      file_id: fileId,
      embedding: embedding,
    });
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
};

export const getEmbedding = async (fileId: string): Promise<number[]> => {
  try {
    const response = await api.get<{ embedding: number[] }>(`/embeddings/${fileId}`);
    return response.data.embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
};

export const searchEmbeddings = async (queryEmbedding: number[]): Promise<{ file_id: string; similarity: number }[]> => {
  try {
    const response = await api.post<{ file_id: string; similarity: number }[]>('/embeddings/search', {
      query_embedding: queryEmbedding,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching embeddings:', error);
    throw error;
  }
};

export const getFiles = async (folderId: string): Promise<FileMetadata[]> => {
  try {
    const response = await api.get<FileMetadata[]>(`/folders/${folderId}/files`);
    return response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

export interface FileStatus {
  status: 'processing' | 'vectorized' | 'error';
  error_message?: string;
}

export const subscribeToFileStatus = (
  fileId: string,
  onUpdate: (status: FileStatus) => void,
  onError?: (error: Error) => void
) => {
  const eventSource = new EventSource(`${API_BASE_URL}/files/${fileId}/status`);

  eventSource.onmessage = (event) => {
    const status = JSON.parse(event.data) as FileStatus;
    onUpdate(status);
    
    // Close connection if file is done processing
    if (status.status === 'vectorized' || status.status === 'error') {
      eventSource.close();
    }
  };

  eventSource.onerror = (error) => {
    eventSource.close();
    onError?.(error as unknown as Error);
  };

  return () => {
    eventSource.close();
  };
};





export const apiService = {
  // Folders
  getFolders: getFolders,

  createFolder: createFolder,

  deleteFolder: deleteFolder,

  getFiles: getFiles,

  uploadFile: uploadFile,

  deleteFile: deleteFile,
}; 