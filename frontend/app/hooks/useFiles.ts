import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { FileMetadata } from '../types';

export const useFiles = () => {
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation<
    FileMetadata,
    Error,
    { folderId: string; file: globalThis.File }
  >({
    mutationFn: ({ folderId, file }) => apiService.uploadFile(folderId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const deleteFileMutation = useMutation<void, Error, string>({
    mutationFn: apiService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  return {
    uploadFile: uploadFileMutation.mutate,
    deleteFile: deleteFileMutation.mutate,
  };
}; 