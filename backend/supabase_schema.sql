-- Enable the pgvector extension
create extension if not exists vector;

-- Create users table
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create folders table
create table if not exists folders (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    status text not null default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create files table
create table if not exists files (
    id uuid primary key default uuid_generate_v4(),
    folder_id uuid references folders(id) on delete cascade not null,
    filename text not null,
    storage_path text not null,
    size integer not null,
    status text not null default 'processing',
    error_message text,
    vectorized_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vectors table
create table if not exists vectors (
    id uuid primary key default uuid_generate_v4(),
    file_id uuid references files(id) on delete cascade not null,
    chunk_index integer not null,
    text text not null,
    vector vector(384) not null,
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

-- Create indexes
create index if not exists idx_files_folder_id on files(folder_id);
create index if not exists idx_vectors_file_id on vectors(file_id);
create index if not exists idx_vectors_vector on vectors using ivfflat (vector vector_cosine_ops) with (lists = 100);
create index if not exists idx_messages_session_id on messages(session_id);
