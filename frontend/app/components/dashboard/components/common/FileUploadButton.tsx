import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadButtonProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onUpload }) => (
  <label className="block">
    <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer">
      <Upload size={16} />
      <span className="text-sm">Upload Files</span>
    </div>
    <input
      type="file"
      multiple
      accept=".pdf,.doc,.docx"
      onChange={onUpload}
      className="hidden"
    />
  </label>
); 