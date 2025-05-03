import React from 'react';
import { ChevronLeft, File as FileIcon } from 'lucide-react';
import { FileItem } from './FileItem';
import { FileUploadButton } from '../common/FileUploadButton';
import { EmptyState } from '../common/EmptyState';
import { Folder, FileMetadata } from '../../../../types';

interface FolderViewProps {
  folder: Folder;
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile: (file: FileMetadata) => void;
}

export const FolderView: React.FC<FolderViewProps> = ({
  folder,
  onBack,
  onUpload,
  onDeleteFile,
}) => {
  const files = folder.files || [];
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Folders</span>
        </button>
        <FileUploadButton onUpload={onUpload} />
      </div>

      <div className="text-lg font-medium text-white">{folder.name}</div>

      {files.length === 0 ? (
        <EmptyState
          icon={<FileIcon size={24} className="text-gray-400" />}
          title="No files in this folder"
          subtitle="Upload files to get started"
        />
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onDelete={() => onDeleteFile(file)}
              />
          ))}
        </div>
      )}
    </div>
  );
}; 