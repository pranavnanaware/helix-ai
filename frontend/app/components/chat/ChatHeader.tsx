import React from 'react';
import { Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  onClear: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClear }) => (
  <div className="p-3 border-b border-gray-800 flex justify-between items-center">
    <h1 className="text-xl font-semibold text-white">Helix AI Recruiting Assistant</h1>
    <button
      onClick={onClear}
      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      title="Clear chat"
    >
      <Trash2 size={20} />
    </button>
  </div>
);

export default ChatHeader; 