-- Enable the pgvector extension
create extension if not exists vector;

-- Create users table
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


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

-- Create indexes
create index if not exists idx_files_folder_id on files(folder_id);
create index if not exists idx_vectors_file_id on vectors(file_id);
create index if not exists idx_vectors_vector on vectors using ivfflat (vector vector_cosine_ops) with (lists = 100);
create index if not exists idx_messages_session_id on messages(session_id);
