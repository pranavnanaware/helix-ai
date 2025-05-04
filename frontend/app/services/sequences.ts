import { Sequence, CreateSequenceData, UpdateSequenceData } from '@/types/sequence';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ListSequencesParams {
  limit?: number;
  offset?: number;
  active_only?: boolean;
}

export const sequenceApi = {
  create: async (data: CreateSequenceData): Promise<Sequence> => {
    const response = await fetch(`${API_BASE_URL}/sequences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create sequence');
    }

    return response.json();
  },

  update: async (sequenceId: string, data: UpdateSequenceData): Promise<Sequence> => {
    const response = await fetch(`${API_BASE_URL}/sequences/${sequenceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update sequence');
    }

    return response.json();
  },

  get: async (sequenceId: string): Promise<Sequence> => {
    const response = await fetch(`${API_BASE_URL}/sequences/${sequenceId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get sequence');
    }

    return response.json();
  },

  delete: async (sequenceId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/sequences/${sequenceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete sequence');
    }
  },

  list: async (params: ListSequencesParams = {}): Promise<{ sequences: Sequence[] }> => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());

      const response = await fetch(`${API_BASE_URL}/sequences?${queryParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list sequences');
    }

    return response.json();
  },

  generate: async (prompt: string): Promise<Sequence> => {
    const response = await fetch(`${API_BASE_URL}/sequences/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate sequence');
    }

    return response.json();
  },

  editWithGPT: async (sequenceId: string, prompt: string): Promise<Sequence> => {
    const response = await fetch(`${API_BASE_URL}/sequences/${sequenceId}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to edit sequence with GPT');
    }

    return response.json();
  },
}; 