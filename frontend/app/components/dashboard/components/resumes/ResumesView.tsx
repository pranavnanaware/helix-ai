import React from 'react';
import { Folder as FolderIcon } from 'lucide-react';
import { NewFolderInput } from './NewFolderInput';
import { FolderItem } from './FolderItem';
import { FolderView } from './FolderView';
import { EmptyState } from '../common/EmptyState';
import { Folder, FileMetadata } from '../../../../types';

interface ResumesViewProps {
  folders: Folder[];
  selectedFolder: Folder | null;
  onFolderSelect: (folder: Folder | null) => void;
  onFolderDelete: (folderId: string) => void;
  onFileUpload: (folderId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: (folderId: string, fileId: string) => void;
  onNewFolderCreate: (name: string) => void;
}

export const ResumesView: React.FC<ResumesViewProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDelete,
  onFileUpload,
  onFileDelete,
  onNewFolderCreate,
}) => {
  if (selectedFolder) {
    const folderWithFiles = {
      ...selectedFolder,
      files: selectedFolder.files || []
    };

    return (
      <FolderView
        folder={folderWithFiles}
        onBack={() => onFolderSelect(null)}
        onUpload={(e: React.ChangeEvent<HTMLInputElement>) => onFileUpload(selectedFolder.id, e)}
        onDeleteFile={(file: FileMetadata) => {
          if (file && file.id) {
            onFileDelete(selectedFolder.id, file.id);
          }
        }}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Resumes</h2>
        <NewFolderInput onCreate={onNewFolderCreate} />
      </div>

      <div className="space-y-2">
        {folders.map((folder: Folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isSelected={selectedFolder?.id === folder.id}
            onSelect={() => onFolderSelect(folder)}
            onDelete={() => onFolderDelete(folder.id)}
          />
        ))}
      </div>

      {folders.length === 0 && (
        <EmptyState
          icon={<FolderIcon size={48} className="mx-auto text-gray-600 mb-4" />}
          title="No folders created yet"
          subtitle="Click 'New Folder' to get started"
        />
      )}
    </div>
  );
}; 