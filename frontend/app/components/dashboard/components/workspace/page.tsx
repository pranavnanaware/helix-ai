'use client';

import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SequenceCard from './SequenceCard';
import { Cross, Trash, X } from 'lucide-react';
import { Sequence } from '@/app/types';

interface WorkspaceProps {
    sequences: Sequence[];
    onSequenceUpdate: (sequence: Sequence) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ sequences, onSequenceUpdate }) => {
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Convert each step into a sequence card
  const stepSequences = useMemo(() => 
    sequences.flatMap(sequence => 
      sequence.steps.map(step => ({
        id: `${sequence.id}-${step.step_number}`,
        title: step.step_title,
        description: step.content,
        content: step.content,
        steps: [step],
        parentId: sequence.id,
        stepNumber: step.step_number
      }))
    ),
    [sequences]
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = stepSequences.findIndex((item) => item.id === active.id);
      const newIndex = stepSequences.findIndex((item) => item.id === over.id);
      
      const newStepSequences = arrayMove(stepSequences, oldIndex, newIndex);
      
      // Group steps by their parent sequence
      const stepsByParent = newStepSequences.reduce((acc, stepSeq) => {
        if (!acc[stepSeq.parentId]) {
          acc[stepSeq.parentId] = [];
        }
        acc[stepSeq.parentId].push(stepSeq.steps[0]);
        return acc;
      }, {} as Record<string, any[]>);

      // Update each parent sequence with its new steps order
      Object.entries(stepsByParent).forEach(([parentId, steps]) => {
        const parentSequence = sequences.find(s => s.id === parentId);
        if (parentSequence) {
          onSequenceUpdate({
            ...parentSequence,
            steps: steps
          });
        }
      });
    }
  };

  const handleStepUpdate = (stepSequence: any, updates: Partial<Sequence['steps'][0]>) => {
    const parentSequence = sequences.find(s => s.id === stepSequence.parentId);
    if (parentSequence) {
      const updatedSteps = parentSequence.steps.map(step => 
        step.step_number === stepSequence.stepNumber ? { ...step, ...updates } : step
      );
      onSequenceUpdate({
        ...parentSequence,
        steps: updatedSteps
      });
    }
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Campaign</h1>
        <div className='flex flex-row gap-4'>
          <button>
            <Trash size={20} 
              onClick={() => { 
                // Implement the logic to delete all sequences
              }}
            />
          </button>
          <button 
            className="bg-rose-500 text-white px-2 py-1 rounded-md hover:bg-rose-600 transition-colors"
          >
            New Campaign
          </button>
        </div>
      </div>

      <div className='flex flex-col mt-8'>
        {sequences.map((sequence) => (
          <div key={sequence.id}>
            <h2 className="text-lg font-bold text-white">{sequence.title}</h2>
            <h4 className='text-sm text-gray-400'>{sequence.description}</h4>
          </div> 
        ))}
      </div>
      <div className="mt-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stepSequences.map(seq => seq.id)}
            strategy={verticalListSortingStrategy}
          >
            {stepSequences.map((sequence) => (
              <SequenceCard
                key={sequence.id}
                sequence={sequence}
                isSelected={selectedSequence?.id === sequence.id}
                onSelect={() => setSelectedSequence(sequence)}
                onUpdate={(updates) => handleStepUpdate(sequence, updates)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

function arrayMove<T>(array: T[], from: number, to: number) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}