import React, { useEffect, useState } from 'react';
import { File as FileIcon, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileMetadata } from '../../../../types';
import { subscribeToFileStatus } from '../../../../services/api';

interface FileItemProps {
  file: FileMetadata;
  onDelete: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, onDelete }) => {
  const [status, setStatus] = useState<FileMetadata['status']>(file.status);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(file.error_message);

  useEffect(() => {
    if (status === 'processing') {
      const unsubscribe = subscribeToFileStatus(
        file.id,
        (update) => {
          setStatus(update.status);
          setErrorMessage(update.error_message);
        },
        (error) => {
          console.error('Error subscribing to file status:', error);
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [file.id, status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 size={16} className="animate-spin text-yellow-500" />;
      case 'vectorized':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <FileIcon size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <div className="text-sm font-medium text-white">{file.filename}</div>
          <div className="text-xs text-gray-400">
            {status === 'error' ? errorMessage : `${(file.size / 1024).toFixed(1)} KB`}
          </div>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}; 