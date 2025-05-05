import React, { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onKeyPress }) => (
  <div className="sticky bottom-0 p-3 border-t border-gray-800">
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Type your message..."
        className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-400"
      />
      <button 
        onClick={onSend}
        className="p-2 text-white bg-rose-900 rounded-xl hover:bg-rose-800 transition-colors shadow-sm hover:shadow-md"
      >
        <Send size={20} />
      </button>
    </div>
  </div>
);

export default ChatInput; 