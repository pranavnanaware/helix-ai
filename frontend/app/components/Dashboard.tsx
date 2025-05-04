'use client'

import React, { useState } from 'react';
import { Folder as FolderType, Sequence } from '../types';
import { ResumesView } from './dashboard/components/resumes/ResumesView';
import { Header } from './dashboard/components/Header';
import { SettingsView } from './dashboard/components/settings/SettingsView';
import { useFolders } from '../hooks/useFolders';
import { useFiles } from '../hooks/useFiles';
import { Workspace } from './dashboard/components/workspace/page';
// Types
type Page = 'workspace' | 'resumes' | 'settings' | 'past-sequences';

interface DashboardProps {
  sequences: Sequence[];
  onSequenceUpdate: (sequence: Sequence) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sequences, onSequenceUpdate }) => {
  const [currentPage, setCurrentPage] = useState<Page>('workspace');
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  
  const { folders, isLoading, error, createFolder, deleteFolder } = useFolders();
  const { uploadFile, deleteFile } = useFiles();

  const handleCreateFolder = (name: string) => {
    createFolder(name);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!folderId) {
      console.error('Folder ID is required');
      return;
    }
    deleteFolder(folderId);
    if (selectedFolder?.id === folderId) {
      setSelectedFolder(null);
    }
  };

  const handleFileUpload = (folderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      uploadFile({ folderId, file });
    });
  };

  const handleDeleteFile = (folderId: string, fileId: string) => {
    if (!fileId) {
      console.error('File ID is required');
      return;
    }
    deleteFile(fileId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'workspace':
        return <Workspace sequences={sequences} onSequenceUpdate={onSequenceUpdate} />;
      case 'resumes':
        return (
          <ResumesView
            folders={folders as FolderType[]}
            selectedFolder={selectedFolder as FolderType}
            onFolderSelect={setSelectedFolder}
            onFolderDelete={handleDeleteFolder}
            onFileUpload={handleFileUpload}
            onFileDelete={handleDeleteFile}
            onNewFolderCreate={handleCreateFolder}
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-500">Error: {error.message}</div>
        ) : (
          renderPage()
        )}
      </div>
    </div>
  );
};

export default Dashboard; 