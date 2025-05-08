import { useState } from 'react';
import { sequenceApi } from '../services/sequences';
import { Sequence, CreateSequenceData, UpdateSequenceData } from '@/types/sequence';

export const useSequence = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSequence = async (data: CreateSequenceData) => {
    setIsLoading(true);
    setError(null);
    try {
      const sequence = await sequenceApi.create(data);
      return sequence;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sequence');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSequence = async (sequenceId: string, data: UpdateSequenceData) => {
    setIsLoading(true);
    setError(null);
    try {
      const sequence = await sequenceApi.update(sequenceId, data);
      return sequence;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sequence');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSequence = async (sequenceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const sequence = await sequenceApi.get(sequenceId);
      return sequence;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sequence');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSequence = async (sequenceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sequenceApi.delete(sequenceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sequence');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const listSequences = async (params?: { 
    limit?: number; 
    offset?: number; 
    active_only?: boolean;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sequenceApi.list(params);
      return response.sequences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list sequences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  return {
    isLoading,
    error,
    createSequence,
    updateSequence,
    getSequence,
    deleteSequence,
    listSequences,
  };
}; 