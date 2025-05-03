import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface NewFolderInputProps {
  onCreate: (name: string) => void;
}

export const NewFolderInput: React.FC<NewFolderInputProps> = ({ onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    setError('');
    onCreate(folderName.trim());
    setFolderName('');
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
      >
        <Plus size={16} />
        <span className="text-sm">New Folder</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={folderName}
        onChange={(e) => {
          setFolderName(e.target.value);
          setError('');
        }}
        placeholder="Folder name"
        className={`bg-gray-800 text-white px-2 py-1 rounded text-sm w-40 focus:outline-none focus:ring-1 ${
          error ? 'ring-red-500' : 'ring-rose-500'
        }`}
        autoFocus
      />
      <button
        type="submit"
        className="text-rose-500 hover:text-rose-400 transition-colors"
      >
        Create
      </button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </form>
  );
}; 

function useEffect(arg0: () => void, arg1: boolean[]) {
  throw new Error('Function not implemented.');
}
