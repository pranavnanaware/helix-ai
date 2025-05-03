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