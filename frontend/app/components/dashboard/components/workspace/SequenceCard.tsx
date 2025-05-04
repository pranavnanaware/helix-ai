import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { SequenceCardProps } from '../../../../types';


const SequenceCard: React.FC<SequenceCardProps> = ({
  sequence,
  isSelected,
  onSelect,
  onUpdate
}) => {
  const step = sequence.steps[0];
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(step.content);
  const [delayDays, setDelayDays] = useState<string>(step.delay_days);
  const [title, setTitle] = useState(step.step_title);

  // Update local state when step changes
  useEffect(() => {
    setContent(step.content);
    setDelayDays(step.delay_days);
    setTitle(step.step_title);
  }, [step]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: sequence.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate({
      content,
      delay_days: delayDays,
      step_title: title
    });
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 my-4 rounded-lg border ${
        isSelected ? 'border-rose-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
            placeholder="Step Title"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Delay:</label>
            <input
              type="text"
              value={delayDays}
              onChange={(e) => setDelayDays(e.target.value)}
              className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <span className="text-sm text-gray-400">days</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setContent(step.content);
                setDelayDays(step.delay_days);
                setTitle(step.step_title);
                setIsEditing(false);
              }}
              className="bg-gray-500 text-white px-2 py-1 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <button
                {...attributes}
                {...listeners}
                className="text-gray-400 hover:text-gray-300 cursor-grab"
              >
                <GripVertical size={16} />
              </button>
              <h3 className="text-lg font-semibold">{step.step_title}</h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-white"
            >
              Edit
            </button>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Delay: {step.delay_days} days</span>
          </div>
          <p className="text-sm text-gray-300">{step.content}</p>
        </div>
      )}
    </div>
  );
};

export default SequenceCard; 