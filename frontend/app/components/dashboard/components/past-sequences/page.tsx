'use client';

import React, { useEffect, useState } from 'react';
import { Sequence } from '@/app/types';
import { Toggle } from '@/components/ui/toggle';
import { useSequence } from '@/app/hooks/useSequence';

interface PastSequencesProps {
  sequences: Sequence[];
  onSequenceUpdate: (sequence: Sequence) => void;
}

export const PastSequences: React.FC<PastSequencesProps> = ({
  sequences,
  onSequenceUpdate
}) => {
  const { listSequences } = useSequence();
  const [publishedSequences, setPublishedSequences] = useState<Sequence[]>([]);

  useEffect(() => {
    const fetchPublishedSequences = async () => {
      try {
        const published = await listSequences({ 
          active_only: false,
          status: 'PUBLISHED'
        });
        setPublishedSequences(published);
      } catch (error) {
        console.error('Failed to fetch published sequences:', error);
      }
    };

    fetchPublishedSequences();
  }, []);

  const handleToggleActive = async (sequence: Sequence) => {
    try {
      const updatedSequence = {
        ...sequence,
        is_active: !sequence.is_active
      };
      onSequenceUpdate(updatedSequence);
      setPublishedSequences(prev => 
        prev.map(s => s.id === sequence.id ? updatedSequence : s)
      );
    } catch (error) {
      console.error('Failed to update sequence:', error);
      alert('Failed to update sequence. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Published Campaigns</h1>
      <div className="space-y-4">
        {publishedSequences.map((sequence) => (
          <div
            key={sequence.id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-white">{sequence.title}</h2>
              <Toggle
                pressed={sequence.is_active}
                onPressedChange={() => handleToggleActive(sequence)}
                className="data-[state=on]:bg-green-500"
              >
                {sequence.is_active ? 'Active' : 'Inactive'}
              </Toggle>
            </div>
            <p className="text-sm text-gray-400 mb-2">{sequence.description}</p>
            <div className="space-y-2">
              {sequence.steps.map((step, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded">
                  <h3 className="text-sm font-medium text-white">{step.step_title}</h3>
                  <p className="text-sm text-gray-300">{step.content}</p>
                  <span className="text-xs text-gray-400">Delay: {step.delay_days} days</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 