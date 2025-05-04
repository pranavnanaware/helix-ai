'use client'

import React, { useState } from 'react';
import { Header } from './dashboard/components/Header';
import { Workspace } from './dashboard/components/workspace/page';
import { SettingsView } from './dashboard/components/settings/SettingsView';
import { Sequence, Page } from '../types';

interface DashboardProps {
  sequences: Sequence[];
  onSequenceUpdate: (sequence: Sequence) => void;
  selectedSequence: Sequence | null;
  setSelectedSequence: (sequence: Sequence | null) => void;
  onSequenceDelete: (sequenceId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  sequences,
  onSequenceUpdate,
  selectedSequence,
  setSelectedSequence,
  onSequenceDelete
}) => {
  const [currentPage, setCurrentPage] = useState<Page>('workspace');

  const renderPage = () => {
    switch (currentPage) {
      case 'workspace':
        return (
          <Workspace
            sequences={sequences}
            onSequenceUpdate={onSequenceUpdate}
            selectedSequence={selectedSequence}
            setSelectedSequence={setSelectedSequence}
            onSequenceDelete={onSequenceDelete}
          />
        );
      case 'past-sequences':
        return <div>Past Sequences</div>;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default Dashboard; 