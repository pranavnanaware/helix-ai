-- Enable the pgvector extension
create extension if not exists vector;



-- Create messages table
create table if not exists messages (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null,
    role text not null check (role in ('system', 'user', 'assistant')),
    content text not null,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sessions table
create table if not exists sessions (
    id uuid primary key default uuid_generate_v4(),
    title text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sequences table
create table if not exists sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    steps JSONB,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create email_queue table
create table if not exists email_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    template_vars JSONB DEFAULT '{}'::jsonb
);

-- Create smtp_settings table
create table if not exists smtp_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL,
    smtp_username TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    use_ssl BOOLEAN DEFAULT false,
    from_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
create index if not exists idx_files_folder_id on files(folder_id);
create index if not exists idx_vectors_file_id on vectors(file_id);
create index if not exists idx_vectors_vector on vectors using ivfflat (vector vector_cosine_ops) with (lists = 100);
create index if not exists idx_messages_session_id on messages(session_id);
create index if not exists idx_email_queue_sequence_id on email_queue(sequence_id);
create index if not exists idx_email_queue_status on email_queue(status);
create index if not exists idx_email_queue_scheduled_time on email_queue(scheduled_time);
create index if not exists idx_email_queue_status_scheduled on email_queue(status, scheduled_time);
