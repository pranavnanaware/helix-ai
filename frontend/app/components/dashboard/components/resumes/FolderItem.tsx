import React from 'react';
import { Folder, File, Trash2 } from 'lucide-react';
import { Folder as FolderType } from '../../../../types';

interface FolderItemProps {
  folder: FolderType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isSelected,
  onSelect,
  onDelete,
}) => (
  <div
    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
      isSelected
        ? 'bg-rose-900/50 border-rose-500'
        : 'bg-gray-800/50 hover:bg-gray-800 border-gray-700'
    } border`}
    onClick={onSelect}
  >
    <div className="flex items-center gap-3">
      <Folder
        size={20}
        className={isSelected ? 'text-rose-500' : 'text-gray-400'}
      />
      <div>
        <div className="text-sm font-medium text-white">{folder.name}</div>
        <div className="text-xs text-gray-400">
          {folder.files?.length || 0} files
        </div>
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="text-gray-400 hover:text-red-500 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  </div>
); 