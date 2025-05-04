from supabase import create_client, Client
from flask import current_app
import os

def get_supabase_client() -> Client:
    """Get a Supabase client instance."""
    url = current_app.config['SUPABASE_URL']
    key = current_app.config['SUPABASE_KEY']
    return create_client(url, key)

def create_folder(name: str):
    """Create a new folder."""
    supabase = get_supabase_client()
    response = supabase.table('folders').insert({
        'name': name,
        'status': 'active'  # active, processing, disabled
    }).execute()
    return response.data[0] if response.data else None


def update_folder_status(folder_id: str, status: str):
    """Update folder status."""
    supabase = get_supabase_client()
    response = supabase.table('folders').update({
        'status': status
    }).eq('id', folder_id).execute()
    return response.data[0] if response.data else None

def delete_folder(folder_id: str):
    """Delete a folder."""
    supabase = get_supabase_client()
    response = supabase.table('folders').delete().eq('id', folder_id).execute()
    return response.data[0] if response.data else None

def upload_file_to_storage(file_path: str, filename: str) -> str:
    """Upload file to Supabase storage and return the URL."""
    supabase = get_supabase_client()
    with open(file_path, 'rb') as f:
        file_data = f.read()
    
    storage_path = f"/{filename}"
    response = supabase.storage.from_('files').upload(storage_path, file_data)
    
    if response.error:
        raise Exception(f"Failed to upload file to storage: {response.error}")
    
    return storage_path

def create_file(folder_id: str, filename: str, storage_path: str, size: int):
    """Create a new file record."""
    supabase = get_supabase_client()
    response = supabase.table('files').insert({
        'folder_id': folder_id,
        'filename': filename,
        'storage_path': storage_path,
        'size': size,
        'status': 'processing',  # processing, vectorized, error
        'vectorized_at': None
    }).execute()
    return response.data[0] if response.data else None

def update_file_status(file_id: str, status: str):
    """Update file status."""
    supabase = get_supabase_client()
    response = supabase.table('files').update({
        'status': status,
        'vectorized_at': 'now()' if status == 'vectorized' else None
    }).eq('id', file_id).execute()
    return response.data[0] if response.data else None

def get_folder_files(folder_id: str):
    """Get all files in a folder."""
    supabase = get_supabase_client()
    response = supabase.table('files').select('*').eq('folder_id', folder_id).execute()
    return response.data

def delete_file(file_id: str):
    """Delete a file record."""
    supabase = get_supabase_client()
    response = supabase.table('files').delete().eq('id', file_id).execute()
    return response.data[0] if response.data else None 