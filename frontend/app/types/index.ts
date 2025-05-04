export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  message: string;
  sequence: Sequence;
  created_at: string;
}

export interface Session {
  session_id: string;
  title: string;
  context: Record<string, any>;
  created_at: string;
}

export interface ChatResponse {
  message: string;
  role: string;
  sequence: Sequence;
  finish_reason: string;
  type: 'chat' | 'sequence_created' | 'sequence_updated';
}

export interface Sequence {
  id: string;
  title: string;
  description: string;
  content: string;
  steps: Array<{
    step_title: string;
    content: string;
    delay_days: string;
    step_number: string;
    type: string;
    is_deleted?: boolean;
  }>;
  status: 'DRAFT' | 'PUBLISHED';
  is_active: boolean;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
}


export interface SequenceCardProps {
  sequence: Sequence;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Sequence['steps'][0]>) => void;
}

export type Page = 'workspace' | 'past-sequences' | 'settings';

export interface DashboardProps {
  sequences: Sequence[];
  onSequenceUpdate: (sequence: Sequence) => void;
}

export interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}
