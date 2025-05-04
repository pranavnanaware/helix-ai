'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SequenceCard from './SequenceCard';
import { Cross, Trash, X, Plus } from 'lucide-react';
import { Sequence } from '@/app/types';
import { useSequence } from '@/app/hooks/useSequence';

interface WorkspaceProps {
    sequences: Sequence[];
    onSequenceUpdate: (sequence: Sequence) => void;
    selectedSequence: Sequence | null;
    setSelectedSequence: (sequence: Sequence | null) => void;
    onSequenceDelete: (sequenceId: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  sequences, 
  onSequenceUpdate,
  selectedSequence,
  setSelectedSequence,
  onSequenceDelete
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSequence, setNewSequence] = useState<Partial<Sequence>>({
    title: '',
    description: '',
    steps: [{
      step_title: '',
      content: '',
      delay_days: '1',
      step_number: '1',
      type: 'email'
    }]
  });
  
  const { createSequence, updateSequence, deleteSequence } = useSequence();
  
  // Get the active sequence (first sequence in the list)
  const activeSequence = sequences[0] || null;
  
  // Update the selected sequence whenever the active sequence changes
  useEffect(() => {
    if (activeSequence && (!selectedSequence || selectedSequence.id !== activeSequence.id)) {
      setSelectedSequence(activeSequence);
    }
  }, [activeSequence, selectedSequence, setSelectedSequence]);

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

  const handleDragEnd = async (event: any) => {
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
      for (const [parentId, steps] of Object.entries(stepsByParent)) {
        const parentSequence = sequences.find(s => s.id === parentId);
        if (parentSequence) {
          const updatedSequence = await updateSequence(parentId, {
            ...parentSequence,
            steps: steps
          });
          onSequenceUpdate(updatedSequence);
        }
      }
    }
  };

  const handleStepUpdate = async (stepSequence: any, updates: Partial<Sequence['steps'][0]>) => {
    const parentSequence = sequences.find(s => s.id === stepSequence.parentId);
    if (parentSequence) {
      if (updates.is_deleted) {
        // Remove the step from the sequence
        const updatedSteps = parentSequence.steps.filter(step => 
          step.step_number !== stepSequence.stepNumber
        );
        // Update step numbers for remaining steps
        const renumberedSteps = updatedSteps.map((step, index) => ({
          ...step,
          step_number: (index + 1).toString()
        }));
        const updatedSequence = await updateSequence(parentSequence.id, {
          ...parentSequence,
          steps: renumberedSteps
        });
        onSequenceUpdate(updatedSequence);
      } else {
        const updatedSteps = parentSequence.steps.map(step => 
          step.step_number === stepSequence.stepNumber ? { ...step, ...updates } : step
        );
        const updatedSequence = await updateSequence(parentSequence.id, {
          ...parentSequence,
          steps: updatedSteps
        });
        onSequenceUpdate(updatedSequence);
      }
    }
  };

  const handleNewStepAdd = () => {
    if (!newSequence.steps) return;
    setNewSequence({
      ...newSequence,
      steps: [
        ...newSequence.steps,
        {
          step_title: '',
          content: '',
          delay_days: '1',
          step_number: (newSequence.steps.length + 1).toString(),
          type: 'email'
        }
      ]
    });
  };

  const handleNewStepUpdate = (index: number, field: string, value: string) => {
    if (!newSequence.steps) return;
    const updatedSteps = [...newSequence.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setNewSequence({
      ...newSequence,
      steps: updatedSteps
    });
  };

  const handleCreateSequence = async () => {
    if (!newSequence.title?.trim() || !newSequence.description?.trim() || 
        !newSequence.steps?.every(step => step.step_title.trim() && step.content.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const sequence = await createSequence({
        title: newSequence.title,
        description: newSequence.description,
        content: newSequence.steps.map(step => step.content).join('\n\n'),
        steps: newSequence.steps
      });

      onSequenceUpdate(sequence);
      setIsCreating(false);
      setNewSequence({
        title: '',
        description: '',
        steps: [{
          step_title: '',
          content: '',
          delay_days: '1',
          step_number: '1',
          type: 'email'
        }]
      });
    } catch (error) {
      console.error('Failed to create sequence:', error);
      alert('Failed to create sequence. Please try again.');
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    try {
      await deleteSequence(sequenceId);
      setSelectedSequence(null);
      onSequenceDelete(sequenceId);
    } catch (error) {
      console.error('Failed to delete sequence:', error);
      alert('Failed to delete sequence. Please try again.');
    }
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Campaign</h1>
        {!isCreating && (
          <div className='flex flex-row gap-4'>
            {activeSequence && (
              <button onClick={() => handleDeleteSequence(activeSequence.id)}>
                <Trash size={20} />
              </button>
            )}
            <button 
              className="bg-rose-500 text-white px-2 py-1 rounded-md hover:bg-rose-600 transition-colors"
              onClick={() => setIsCreating(true)}
            >
              New Campaign
            </button>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg space-y-6">
          <div>
            <input
              type="text"
              value={newSequence.title}
              onChange={(e) => setNewSequence({ ...newSequence, title: e.target.value })}
              className="w-full bg-gray-700 text-white text-2xl font-bold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Enter campaign title"
            />
          </div>

          <div>
            <textarea
              value={newSequence.description}
              onChange={(e) => setNewSequence({ ...newSequence, description: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Enter campaign description"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Steps</h3>
              <button
                onClick={handleNewStepAdd}
                className="flex items-center text-rose-500 hover:text-rose-400"
              >
                <Plus size={16} className="mr-1" />
                Add Step
              </button>
            </div>

            {newSequence.steps?.map((step, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-medium">Step {step.step_number}</h4>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const updatedSteps = newSequence.steps?.filter((_, i) => i !== index);
                        if (updatedSteps) {
                          setNewSequence({
                            ...newSequence,
                            steps: updatedSteps.map((step, i) => ({
                              ...step,
                              step_number: (i + 1).toString()
                            }))
                          });
                        }
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={step.step_title}
                    onChange={(e) => handleNewStepUpdate(index, 'step_title', e.target.value)}
                    className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Enter step title"
                  />
                </div>

                <div>
                  <textarea
                    value={step.content}
                    onChange={(e) => handleNewStepUpdate(index, 'content', e.target.value)}
                    className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Enter step content"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={step.delay_days}
                      onChange={(e) => handleNewStepUpdate(index, 'delay_days', e.target.value)}
                      className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      min="1"
                      placeholder="Delay days"
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewSequence({
                  title: '',
                  description: '',
                  steps: [{
                    step_title: '',
                    content: '',
                    delay_days: '1',
                    step_number: '1',
                    type: 'email'
                  }]
                });
              }}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSequence}
              className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600 transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stepSequences.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{selectedSequence?.title}</h2>
            <p className="text-sm text-gray-400">{selectedSequence?.description}</p>
          </div>
            {stepSequences.map((sequence) => (
              <SequenceCard
                key={sequence.id}
                sequence={sequence}
                isSelected={activeSequence?.id === sequence.parentId}
                onSelect={() => setSelectedSequence(sequences.find(s => s.id === sequence.parentId) || null)}
                onUpdate={(updates) => handleStepUpdate(sequence, updates)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

function arrayMove<T>(array: T[], from: number, to: number) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}