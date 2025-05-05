'use client';

import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import Dashboard from '../components/Dashboard';
import { Sequence } from '../types';

const MainLayout: React.FC = () => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

  const handleSequenceUpdate = (sequence: Sequence) => {
    setSequences(prev => {
      const existingIndex = prev.findIndex(s => s.id === sequence.id);
      if (existingIndex === -1) {
        return [sequence];
      }
      const updated = [...prev];
      updated[existingIndex] = sequence;
      return updated;
    });
  };

  const handleSequenceDelete = (deletedId: string) => {
    setSequences(prev =>
      prev.filter(s => s.id !== deletedId)
    );
    setSelectedSequence(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '35%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <ChatInterface 
          sequences={sequences} 
          onSequenceCreated={handleSequenceUpdate} 
          selectedSequence={selectedSequence}
        />
      </div>
      <div style={{ width: '65%' }}>
        <Dashboard 
          sequences={sequences} 
          onSequenceUpdate={handleSequenceUpdate} 
          selectedSequence={selectedSequence}
          setSelectedSequence={setSelectedSequence}
          onSequenceDelete={handleSequenceDelete}
        />
      </div>
    </div>
  );
};

export default MainLayout;