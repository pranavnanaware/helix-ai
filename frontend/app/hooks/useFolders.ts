import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Folder as FolderType } from '../types';

export const useFolders = () => {
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading, error } = useQuery<FolderType[], Error>({
    queryKey: ['folders'],
    queryFn: apiService.getFolders,
  });

  const createFolderMutation = useMutation<FolderType, Error, string>({
    mutationFn: apiService.createFolder,
    onSuccess: (newFolder: FolderType) => {
      queryClient.setQueryData<FolderType[]>(['folders'], (old = []) => [...old, newFolder]);
    },
  });

  const deleteFolderMutation = useMutation<void, Error, string>({
    mutationFn: apiService.deleteFolder,
    onSuccess: (_: void, folderId: string) => {
      queryClient.setQueryData<FolderType[]>(['folders'], (old = []) => 
        old.filter(folder => folder.id !== folderId)
      );
    },
  });

  return {
    folders,
    isLoading,
    error,
    createFolder: createFolderMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
  };
}; 