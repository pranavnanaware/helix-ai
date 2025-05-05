import React, { useState } from 'react';
import { Sequence } from '@/app/types';
import { Plus, X } from 'lucide-react';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSequenceCreated: (sequence: Sequence) => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ isOpen, onClose, onSequenceCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Array<{
    step_title: string;
    content: string;
    delay_days: string;
    step_number: string;
    type: string;
  }>>([{
    step_title: '',
    content: '',
    delay_days: '1',
    step_number: '1',
    type: 'email'
  }]);

  const handleAddStep = () => {
    setSteps([...steps, {
      step_title: '',
      content: '',
      delay_days: '1',
      step_number: (steps.length + 1).toString(),
      type: 'email'
    }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Update step numbers
    const updatedSteps = newSteps.map((step, i) => ({
      ...step,
      step_number: (i + 1).toString()
    }));
    setSteps(updatedSteps);
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setSteps(newSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !description.trim() || steps.some(step => !step.step_title.trim() || !step.content.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    const newSequence: Sequence = {
      id: Date.now().toString(), // Temporary ID, will be replaced by backend
      title,
      description,
      content: steps.map(step => step.content).join('\n\n'),
      steps,
      is_active: false,
      status: 'DRAFT'
    };

    onSequenceCreated(newSequence);
    // Reset form
    setTitle('');
    setDescription('');
    setSteps([{
      step_title: '',
      content: '',
      delay_days: '1',
      step_number: '1',
      type: 'email'
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-3/4 h-3/4 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter campaign title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter campaign description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Steps</h3>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex items-center text-rose-500 hover:text-rose-400"
                >
                  <Plus size={16} className="mr-1" />
                  Add Step
                </button>
              </div>

              {steps.map((step, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-medium">Step {step.step_number}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Step Title
                    </label>
                    <input
                      type="text"
                      value={step.step_title}
                      onChange={(e) => handleStepChange(index, 'step_title', e.target.value)}
                      className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Enter step title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      value={step.content}
                      onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                      className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Enter step content"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Delay Days
                      </label>
                      <input
                        type="number"
                        value={step.delay_days}
                        onChange={(e) => handleStepChange(index, 'delay_days', e.target.value)}
                        className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={step.type}
                        onChange={(e) => handleStepChange(index, 'type', e.target.value)}
                        className="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      >
                        <option value="email">Email</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="call">Call</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600 transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCampaignModal; 