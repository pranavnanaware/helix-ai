export interface Folder {
  id: string;
  name: string;
  created_at: string;
  status: 'active' | 'deleted';
  files?: File[];
}

export interface File {
  id: string;
  folder_id: string;
  filename: string;
  storage_path: string;
  size: number;
  status: 'processing' | 'vectorized' | 'error';
  created_at: string;
  vectorized_at?: string;
  error_message?: string;
}

// Alias for File to avoid conflicts with global File type
export type FileMetadata = File;

export interface Embedding {
  id: string;
  file_id: string;
  embedding: number[];
  created_at: string;
}

export interface SearchResult {
  file_id: string;
  similarity: number;
} 

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  sequence: Sequence;
  created_at: string;
}

export interface Session {
  session_id: string;
  title: string;
  context: Record<string, any>;
  created_at: string;
}

export interface ChatResponse {
  message: string;
  role: string;
  sequence: Sequence;
  finish_reason: string;
}

export interface Sequence {
  id: string;
  title: string;
  description: string;
  content: string;
  steps: Step[];
}

export interface Step {
  content: string;
  delay_days: string;
  step_number: string;
  type: string;
  step_title: string;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
}
