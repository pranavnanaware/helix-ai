export interface Sequence {
  id: string;
  title: string;
  description: string;
  content: string;
  steps: Step[];
}

export interface Step {
  content: string;
  delay_days: string;
  step_number: string;
  type: string;
  step_title: string;
}

export interface CreateSequenceData {
  title: string;
  description: string;
  content: string;
  steps: Step[];
}

export interface UpdateSequenceData extends Partial<CreateSequenceData> {
  is_active?: boolean;
} 