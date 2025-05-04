'use client';

import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import Dashboard from '../components/Dashboard';
import { Sequence } from '../types';

const MainLayout: React.FC = () => {
  const [sequences, setSequences] = useState<Sequence[]>([]);

  const handleSequenceUpdate = (sequence: Sequence) => {
    setSequences(prev => {
      const existingIndex = prev.findIndex(s => s.id === sequence.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = sequence;
        return updated;
      } else {
        return [...prev, sequence];
      }
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '35%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <ChatInterface onSequenceCreated={handleSequenceUpdate} />
      </div>
      <div style={{ width: '65%' }}>
        <Dashboard sequences={sequences} onSequenceUpdate={handleSequenceUpdate} />
      </div>
    </div>
  );
};

export default MainLayout;