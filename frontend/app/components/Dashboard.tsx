'use client'

import React, { useState } from 'react';
import { Header } from './dashboard/components/Header';
import { Workspace } from './dashboard/components/workspace/page';
import { PastSequences } from './dashboard/components/past-sequences/page';
import { Sequence, Page } from '../types';

interface DashboardProps {
  sequences: Sequence[];
  onSequenceUpdate: (sequence: Sequence) => void;
  selectedSequence: Sequence | null;
  setSelectedSequence: (sequence: Sequence | null) => void;
  onSequenceDelete: (sequenceId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  ...props  
}) => {
  const [currentPage, setCurrentPage] = useState<Page>('workspace');

  const renderPage = () => {
    switch (currentPage) {
      case 'workspace':
        return (
          <Workspace
            {...props}
          />
        );
      case 'published-campaigns':
        return (
          <PastSequences
            {...props}
          />
        );
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